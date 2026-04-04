import express from "express";
import { body } from "express-validator";
import validate from "../middleware/validator.js";
import { pool } from "../db.js";
import authMiddleware from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import sendEmail from "../utils/mailer.js";
import { logActivity } from "../utils/activity.js";
import logger from "../utils/logger.js";

const router = express.Router();

// Report validation rules
const reportValidation = [
  body("title").trim().isLength({ min: 5, max: 200 }).withMessage("Title must be between 5 and 200 characters"),
  body("description").trim().isLength({ min: 20 }).withMessage("Description must be at least 20 characters"),
  body("severity").isIn(["low", "medium", "high", "critical"]).withMessage("Invalid severity level"),
  body("program_id").isUUID().withMessage("Valid Program ID is required"),
  validate
];

// Create a new report (Authenticated) with optional Evidence Upload
router.post("/", authMiddleware, upload.single("evidence"), reportValidation, async (req, res, next) => {
  try {
    const { title, description, severity, program_id } = req.body;
    const userId = req.user.id;
    const userEmail = req.user.email;
    let evidence_url = null;

    // Handle file upload if present
    if (req.file) {
      try {
        evidence_url = await uploadToCloudinary(req.file.buffer);
      } catch (uploadErr) {
        logger.error("Cloudinary Upload Error: " + uploadErr.message);
        return res.status(500).json({ 
          error: "Failed to upload evidence to cloud", 
          details: uploadErr.message 
        });
      }
    }

    const newReport = await pool.query(
      "INSERT INTO reports (title, description, severity, user_id, program_id, evidence_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [title, description, severity, userId, program_id, evidence_url]
    );

    const report = newReport.rows[0];

    // Log the initial submission (Day 5)
    await logActivity(report.id, userId, "report_submitted", { 
      severity, 
      has_evidence: !!evidence_url 
    });

    // Notification: Researcher confirmation
    await sendEmail(
      userEmail,
      `[Debugr] Bug Report Submitted: ${title}`,
      `Hi! We received your report "${title}". Our triage team is reviewing it. Current Status: ${report.status}`,
      `<h2>Report Confirmed</h2><p>Hi!</p><p>We received your report "<strong>${title}</strong>".</p><p>Status: <span style="color: blue;">${report.status}</span></p><p>Our triage team will review it soon.</p>`
    );

    res.status(201).json({
      success: true,
      report
    });
  } catch (err) {
    next(err);
  }
});

// List user's own reports (Hacker View)
router.get("/my-reports", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const reports = await pool.query(
      `SELECT r.*, p.name as company 
       FROM reports r 
       LEFT JOIN programs p ON r.program_id = p.id 
       WHERE r.user_id = $1 
       ORDER BY r.created_at DESC`,
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

// List reports for a company (Company View)
router.get("/company", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    if (role !== "company" && role !== "admin") {
      throw new ApiError(403, "Access denied. Company role required.");
    }

    const reports = await pool.query(
      `SELECT r.*, p.name as program_name, u.email as hacker_email
       FROM reports r
       JOIN programs p ON r.program_id = p.id
       JOIN users u ON r.user_id = u.id
       WHERE p.company_id = $1
       ORDER BY r.created_at DESC`,
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

// Update report status (Company Triage)
router.patch("/:id/status", authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, bounty, admin_notes } = req.body;
    const companyId = req.user.id;

    // Verify ownership
    const reportCheck = await pool.query(
      "SELECT r.id, p.company_id FROM reports r JOIN programs p ON r.program_id = p.id WHERE r.id = $1",
      [id]
    );

    if (reportCheck.rows.length === 0) {
      throw new ApiError(404, "Report not found");
    }

    if (reportCheck.rows[0].company_id !== companyId && req.user.role !== "admin") {
      throw new ApiError(403, "Access denied. You do not own the program for this report.");
    }

    const updatedReport = await pool.query(
      "UPDATE reports SET status = COALESCE($1, status), bounty = COALESCE($2, bounty), admin_notes = COALESCE($3, admin_notes) WHERE id = $4 RETURNING *",
      [status, bounty, admin_notes, id]
    );

    // Log the triage action
    await logActivity(id, companyId, `status_updated_to_${status}`, { status, bounty });

    res.json({
      success: true,
      report: updatedReport.rows[0]
    });
  } catch (err) {
    next(err);
  }
});

export default router;
