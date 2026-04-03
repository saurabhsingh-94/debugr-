import express from "express";
import { pool } from "../db.js";
import authMiddleware from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

const router = express.Router();

// Create a new report (Authenticated) with optional Evidence Upload
router.post("/", authMiddleware, upload.single("evidence"), async (req, res, next) => {
  try {
    const { title, description, severity } = req.body;
    const userId = req.user.id;
    let evidence_url = null;

    if (!title || !description || !severity) {
      return res.status(400).json({ error: "Title, description, and severity are required" });
    }

    // Handle file upload if present
    if (req.file) {
      try {
        evidence_url = await uploadToCloudinary(req.file.buffer);
      } catch (uploadErr) {
        return res.status(500).json({ error: "Failed to upload evidence to cloud" });
      }
    }

    const newReport = await pool.query(
      "INSERT INTO reports (title, description, severity, user_id, evidence_url) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [title, description, severity, userId, evidence_url]
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
