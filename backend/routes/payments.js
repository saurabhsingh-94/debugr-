import express from "express";
import { Cashfree } from "cashfree-pg";
import config from "../config/config.js";
import ApiError from "../utils/ApiError.js";
import { authenticate } from "../middleware/auth.js";
import logger from "../utils/logger.js";

const router = express.Router();

Cashfree.XClientId = config.cashfree.appId;
Cashfree.XClientSecret = config.cashfree.secretKey;
Cashfree.XEnvironment = config.cashfree.env === "PROD" 
  ? (Cashfree.Environment?.PRODUCTION || "PRODUCTION") 
  : (Cashfree.Environment?.SANDBOX || "SANDBOX");

router.post("/create-order", authenticate, async (req, res, next) => {
  try {
    const { orderAmount, orderCurrency, customerDetails } = req.body;

    if (!orderAmount || !customerDetails || !customerDetails.customer_id || !customerDetails.customer_phone) {
      throw new ApiError(400, "Missing required fields for Cashfree order");
    }

    const orderId = `order_${Date.now()}_${req.user.id}`;

    const request = {
      order_amount: orderAmount,
      order_currency: orderCurrency || "INR",
      order_id: orderId,
      customer_details: {
        ...customerDetails,
        customer_id: String(customerDetails.customer_id),
        customer_phone: String(customerDetails.customer_phone).slice(0, 10),
      },
      order_meta: {
        return_url: `${req.headers.origin || 'https://debugr.app'}/add-funds/status?order_id={order_id}`
      }
    };

    // Check if Cashfree is configured
    if (!config.cashfree.appId || !config.cashfree.secretKey) {
      throw new ApiError(503, "Payment gateway not configured. Please add CASHFREE_APP_ID and CASHFREE_SECRET_KEY to environment.");
    }

    const response = await Cashfree.PGCreateOrder("2023-08-01", request);
    
    res.json({
      success: true,
      data: {
        payment_session_id: response.data.payment_session_id,
        order_id: response.data.order_id
      }
    });

  } catch (error) {
    if (error.response?.data?.message) {
      logger.error(`Cashfree API Error: ${error.response.data.message}`);
      return next(new ApiError(error.response.status || 400, `Payment Provider Error: ${error.response.data.message}`));
    }
    logger.error(`Cashfree Create Order Error: ${error.message}`);
    next(new ApiError(500, error.message || "Failed to create payment order"));
  }
});

router.post("/verify", authenticate, async (req, res, next) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      throw new ApiError(400, "Missing order_id");
    }

    const response = await Cashfree.PGOrderFetchPayments("2023-08-01", orderId);
    
    // check if the payment is SUCCESS
    const successPayment = response.data.find(payment => payment.payment_status === "SUCCESS");
    
    if (successPayment) {
      // Record transaction in DB if success
      await pool.query(
        `INSERT INTO transactions (user_id, type, amount, currency, status, reference_id, details) 
         VALUES ($1, 'top_up', $2, $3, 'completed', $4, $5)
         ON CONFLICT (reference_id) DO NOTHING`,
        [req.user.id, successPayment.payment_amount, successPayment.payment_currency, orderId, JSON.stringify(successPayment)]
      );
      
      logger.info(`💰 User ${req.user.id} topped up ${successPayment.payment_amount}`);
    }
    
    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    logger.error(`Cashfree Verify Payment Error: ${error.response?.data?.message || error.message}`);
    next(new ApiError(500, error.response?.data?.message || "Failed to verify payment"));
  }
});

export default router;
