import express from "express";
import { pool } from "../db.js";
import authMiddleware from "../middleware/auth.js";
import ApiError from "../utils/ApiError.js";
import upload from "../middleware/upload.js";
import { v2 as cloudinary } from "cloudinary";
import config from "../config/config.js";
import logger from "../utils/logger.js";
import { Cashfree, CFEnvironment, CFConfig } from "cashfree-pg";

// Configure Cloudinary from config
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret
});

// Initialize Cashfree Instance (v5+)
const cashfree = new Cashfree(
  config.cashfree.env === "PROD" ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX,
  config.cashfree.appId,
  config.cashfree.secretKey
);

const router = express.Router();

// 1. Upload Image Proof (Secure Proxy)
router.post("/upload", authMiddleware, upload.single("image"), async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ApiError(400, "No image file provided");
    }

    // Convert buffer to base64 for Cloudinary
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = "data:" + req.file.mimetype + ";base64," + b64;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "marketplace_proofs",
      resource_type: "auto"
    });

    res.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id
    });
  } catch (err) {
    logger.error("Marketplace Upload Error:", err);
    next(err);
  }
});

// 2. List Prompts
router.get("/", async (req, res, next) => {
  try {
    const { category, search } = req.query;
    let query = `
      SELECT p.*, u.handle as seller_handle, u.avatar_url as seller_avatar
      FROM prompts p
      JOIN users u ON p.seller_id = u.id
      WHERE p.status = 'active'
    `;
    const params = [];

    if (category && category !== 'All') {
      params.push(category);
      query += ` AND p.category = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (p.title ILIKE $${params.length} OR p.description ILIKE $${params.length})`;
    }

    query += ` ORDER BY p.created_at DESC`;

    const result = await pool.query(query, params);
    res.json({ success: true, prompts: result.rows });
  } catch (err) {
    next(err);
  }
});

// 3. Get Single Prompt Detail
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Get prompt info
    const promptResult = await pool.query(`
      SELECT p.*, u.handle as seller_handle, u.avatar_url as seller_avatar
      FROM prompts p
      JOIN users u ON p.seller_id = u.id
      WHERE p.id = $1
    `, [id]);

    if (promptResult.rows.length === 0) {
      throw new ApiError(404, "Prompt not found");
    }

    // Get comments/reviews
    const commentsResult = await pool.query(`
      SELECT c.*, u.handle, u.avatar_url
      FROM marketplace_comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.prompt_id = $1
      ORDER BY c.created_at DESC
    `, [id]);

    res.json({
      success: true,
      prompt: promptResult.rows[0],
      comments: commentsResult.rows
    });
  } catch (err) {
    next(err);
  }
});

// 4. List a NEW Prompt
router.post("/", authMiddleware, async (req, res, next) => {
  try {
    const { title, description, category, price, content, proof_urls } = req.body;
    const seller_id = req.user.id;

    if (!title || !description || !category || !price || !content) {
      throw new ApiError(400, "Missing required fields");
    }

    const result = await pool.query(`
      INSERT INTO prompts (seller_id, title, description, category, price, content, proof_urls)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [seller_id, title, description, category, price, content, JSON.stringify(proof_urls || [])]);

    res.status(201).json({
      success: true,
      message: "Prompt listed successfully",
      prompt: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
});

// 5. Create Cashfree Order for Purchase
router.post("/buy/:id", authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const buyer_id = req.user.id;

    const promptResult = await pool.query("SELECT * FROM prompts WHERE id = $1", [id]);
    if (promptResult.rows.length === 0) throw new ApiError(404, "Prompt missing");

    const prompt = promptResult.rows[0];
    const orderAmount = parseFloat(prompt.price);
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Get buyer info for Cashfree
    const userResult = await pool.query("SELECT email FROM users WHERE id = $1", [buyer_id]);
    const buyerEmail = userResult.rows[0].email;

    const request = {
      order_amount: orderAmount,
      order_currency: "INR", // Cashfree primarily handles INR
      order_id: orderId,
      customer_details: {
        customer_id: buyer_id,
        customer_email: buyerEmail,
        customer_phone: "9999999999", // Mock phone as it's required
      },
      order_meta: {
        return_url: `${config.corsWhitelist[0]}/marketplace/success?order_id={order_id}`,
        notify_url: `${process.env.BACKEND_URL}/api/payments/webhook`,
      }
    };

    const response = await cashfree.PGCreateOrder("2023-08-01", request);
    
    // Log transaction as pending
    await pool.query(`
      INSERT INTO transactions (user_id, type, amount, currency, status, reference_id, details)
      VALUES ($1, 'hold', $2, 'INR', 'pending', $3, $4)
    `, [buyer_id, orderAmount, orderId, JSON.stringify({ prompt_id: id })]);

    res.json({
      success: true,
      payment_session_id: response.data.payment_session_id,
      order_id: orderId
    });
  } catch (err) {
    logger.error("Cashfree Order Creation Error:", err);
    next(err);
  }
});

// 6. Like Toggle
router.post("/like/:id", authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if already liked
    const checkLike = await pool.query(
      "SELECT id FROM marketplace_likes WHERE prompt_id = $1 AND user_id = $2",
      [id, userId]
    );

    if (checkLike.rows.length > 0) {
      // Unlike
      await pool.query("DELETE FROM marketplace_likes WHERE id = $1", [checkLike.rows[0].id]);
      await pool.query("UPDATE prompts SET likes_count = likes_count - 1 WHERE id = $1", [id]);
      res.json({ success: true, liked: false });
    } else {
      // Like
      await pool.query(
        "INSERT INTO marketplace_likes (prompt_id, user_id) VALUES ($1, $2)",
        [id, userId]
      );
      await pool.query("UPDATE prompts SET likes_count = likes_count + 1 WHERE id = $1", [id]);
      res.json({ success: true, liked: true });
    }
  } catch (err) {
    next(err);
  }
});

// 7. Add Comment & Rating
router.post("/comment/:id", authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { message, rating } = req.body;

    if (!message || !rating) throw new ApiError(400, "Message and rating are required");

    await pool.query(`
      INSERT INTO marketplace_comments (prompt_id, user_id, message, rating)
      VALUES ($1, $2, $3, $4)
    `, [id, userId, message, rating]);

    // Update average rating
    const avgResult = await pool.query(
      "SELECT AVG(rating) as avg FROM marketplace_comments WHERE prompt_id = $1",
      [id]
    );
    await pool.query("UPDATE prompts SET avg_rating = $1 WHERE id = $2", [avgResult.rows[0].avg, id]);

    res.json({ success: true, message: "Review submitted" });
  } catch (err) {
    next(err);
  }
});

// 8. Check Order Status
router.get("/order-status/:orderId", authMiddleware, async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const response = await cashfree.PGFetchOrder("2023-08-01", orderId);
    
    // If PAID, update the local transaction and grant access
    if (response.data.order_status === "PAID") {
       // Check if already processed
       const txn = await pool.query("SELECT status FROM transactions WHERE reference_id = $1", [orderId]);
       if (txn.rows[0]?.status === 'pending') {
          await pool.query("UPDATE transactions SET status = 'completed' WHERE reference_id = $1", [orderId]);
          
          // Grant access (Example logic: insert into prompt_purchases)
          const details = JSON.parse(txn.rows[0].details || '{}');
          if (details.prompt_id) {
             await pool.query(
               "INSERT INTO prompt_purchases (prompt_id, buyer_id, order_id) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING",
               [details.prompt_id, req.user.id, orderId]
             );
          }
       }
    }

    res.json({ 
      success: true, 
      status: response.data.order_status,
      order: response.data
    });
  } catch (err) {
    logger.error("Order Status Error:", err);
    next(err);
  }
});

export default router;
