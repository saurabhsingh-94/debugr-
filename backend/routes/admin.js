import express from "express";
import { pool } from "../db.js";
import authMiddleware from "../middleware/auth.js";
import adminMiddleware from "../middleware/admin.js";

const router = express.Router();

// Apply auth and admin middleware to all routes in this file
router.use(authMiddleware, adminMiddleware);

// GET ALL reports (for Triage)
router.get("/reports", async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT r.*, u.email as researcher_email 
      FROM reports r 
      JOIN users u ON r.user_id = u.id 
      ORDER BY r.created_at DESC
    `);

    res.json({
      success: true,
      count: result.rows.length,
      reports: result.rows
    });
  } catch (err) {
    next(err);
  }
});

// Update Report Status/Severity/Bounty
router.patch("/reports/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, severity, bounty, admin_notes } = req.body;

    // Check if report exists
    const checkResult = await pool.query("SELECT * FROM reports WHERE id = $1", [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: "Report not found" });
    }

    const currentReport = checkResult.rows[0];

    // Build update query dynamically
    const fields = [];
    const values = [];
    let idx = 1;

    if (status) { fields.push(`status = $${idx++}`); values.push(status); }
    if (severity) { fields.push(`severity = $${idx++}`); values.push(severity); }
    if (bounty !== undefined) { fields.push(`bounty = $${idx++}`); values.push(bounty); }
    if (admin_notes !== undefined) { fields.push(`admin_notes = $${idx++}`); values.push(admin_notes); }
    if (evidence_url !== undefined) { fields.push(`evidence_url = $${idx++}`); values.push(evidence_url); }

    if (fields.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    values.push(id);
    const updateResult = await pool.query(
      `UPDATE reports SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
      values
    );

    res.json({
      success: true,
      report: updateResult.rows[0]
    });
  } catch (err) {
    next(err);
  }
});

export default router;
