import express from "express";
import { pool } from "../db.js";
import authMiddleware from "../middleware/auth.js";
import adminMiddleware from "../middleware/admin.js";
import sendEmail from "../utils/mailer.js";

const router = express.Router();

// Apply auth and admin middleware to all routes in this file
router.use(authMiddleware, adminMiddleware);

// GET Statistics for Admin Dashboard
router.get("/stats", async (req, res, next) => {
  try {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_reports,
        COUNT(*) FILTER (WHERE status = 'open') as open_reports,
        COUNT(*) FILTER (WHERE severity = 'critical') as critical_bugs,
        COALESCE(SUM(bounty), 0) as total_bounties_paid
      FROM reports
    `);

    const users = await pool.query("SELECT COUNT(*) as total_users FROM users WHERE role = 'researcher'");

    res.json({
      success: true,
      stats: {
        ...stats.rows[0],
        total_users: users.rows[0].total_users
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET ALL reports (with Pagination and Filtering)
router.get("/reports", async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT r.*, u.email as researcher_email 
      FROM reports r 
      JOIN users u ON r.user_id = u.id 
    `;
    const values = [];

    if (status) {
      query += " WHERE r.status = $1 ";
      values.push(status);
    }

    query += ` ORDER BY r.created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, values);
    const countResult = await pool.query("SELECT COUNT(*) FROM reports" + (status ? " WHERE status = $1" : ""), status ? [status] : []);

    res.json({
      success: true,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit),
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
    const { status, severity, bounty, admin_notes, evidence_url } = req.body;

    // Check if report exists and get researcher email
    const checkResult = await pool.query(`
      SELECT r.*, u.email as researcher_email 
      FROM reports r
      JOIN users u ON r.user_id = u.id
      WHERE r.id = $1
    `, [id]);
    
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

    const updatedReport = updateResult.rows[0];

    // Notification: researcher update
    if (status || bounty !== undefined) {
      const subject = bounty !== undefined ? `💰 Bounty Awarded: ${updatedReport.title}` : `📉 Status Updated: ${updatedReport.title}`;
      const msg = bounty !== undefined 
        ? `Congratulations! You have been awarded a bounty of $${bounty} for your report "${updatedReport.title}".`
        : `Your bug report "${updatedReport.title}" has been updated to "${status}".`;

      await sendEmail(
        checkResult.rows[0].researcher_email,
        subject,
        msg,
        `<h3>Platform Update</h3><p>${msg}</p><p>Keep up the great work!</p>`
      );
    }

    res.json({
      success: true,
      report: updatedReport
    });
  } catch (err) {
    next(err);
  }
});

export default router;
