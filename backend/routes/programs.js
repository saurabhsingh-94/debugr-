import express from "express";
import { pool } from "../db.js";
import ApiError from "../utils/ApiError.js";
import cache from "../middleware/cache.js";

import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// List all programs (Cached for 1 minute)
router.get("/", cache(60), async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT id, name, description, type, logo_url, reward_min, reward_max, scope FROM programs ORDER BY name ASC"
    );
    res.json({ success: true, programs: result.rows });
  } catch (err) {
    next(err);
  }
});

// Get programs managed by the logged-in company
router.get("/managed", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    if (role !== "company" && role !== "admin") {
      throw new ApiError(403, "Access denied. Company role required.");
    }

    const result = await pool.query(
      "SELECT * FROM programs WHERE company_id = $1 ORDER BY created_at DESC",
      [userId]
    );

    res.json({
      success: true,
      count: result.rows.length,
      programs: result.rows
    });
  } catch (err) {
    next(err);
  }
});

// Get program details by ID
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT * FROM programs WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      throw new ApiError(404, "Program not found");
    }

    res.json({ success: true, program: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// GET global platform stats (Public)
router.get("/stats/global", async (req, res, next) => {
  try {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_reports,
        COUNT(*) FILTER (WHERE status = 'resolved') as resolved_bugs,
        COALESCE(SUM(bounty), 0) as total_bounties_paid
      FROM reports
    `);

    const users = await pool.query("SELECT COUNT(*) as total_hackers FROM users WHERE role = 'hacker'");

    res.json({
      success: true,
      stats: {
        total_payouts: stats.rows[0].total_bounties_paid,
        total_resolved: stats.rows[0].resolved_bugs,
        total_hackers: users.rows[0].total_hackers,
        total_companies: 340 // Placeholder for now or count companies in users table if applicable
      }
    });
  } catch (err) {
    next(err);
  }
});

// Create a new program (Company only)
router.post("/", authMiddleware, async (req, res, next) => {
  try {
    const { name, description, type, reward_min, reward_max, scope, logo_url } = req.body;
    const company_id = req.user.id;

    if (req.user.role !== "company" && req.user.role !== "admin") {
      throw new ApiError(403, "Access denied. Company role required to launch programs.");
    }

    const result = await pool.query(
      `INSERT INTO programs (name, description, type, reward_min, reward_max, scope, logo_url, company_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [name, description, type || 'public', reward_min || 0, reward_max || 0, JSON.stringify(scope || []), logo_url, company_id]
    );

    res.status(201).json({
      success: true,
      message: "Security program initialized and deployed to the grid.",
      program: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
});

export default router;
