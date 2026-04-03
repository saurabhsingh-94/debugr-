import express from "express";
import { pool } from "../db.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// Create a new report (Authenticated)
router.post("/", authMiddleware, async (req, res, next) => {
  try {
    const { title, description, severity } = req.body;
    const userId = req.user.id;

    if (!title || !description || !severity) {
      return res.status(400).json({ error: "Title, description, and severity are required" });
    }

    const newReport = await pool.query(
      "INSERT INTO reports (title, description, severity, user_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [title, description, severity, userId]
    );

    res.status(201).json({
      success: true,
      report: newReport.rows[0]
    });
  } catch (err) {
    next(err);
  }
});

// List user's own reports (Authenticated)
router.get("/my-reports", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const reports = await pool.query(
      "SELECT * FROM reports WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );

    res.json({
      success: true,
      count: reports.rows.length,
      reports: reports.rows
    });
  } catch (err) {
    next(err);
  }
});

export default router;
