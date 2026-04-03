import express from "express";
import { body } from "express-validator";
import validate from "../middleware/validator.js";
import { pool } from "../db.js";
import authMiddleware from "../middleware/auth.js";
import ApiError from "../utils/ApiError.js";
import { logActivity } from "../utils/activity.js";

const router = express.Router();

// Get comments for a report
router.get("/:reportId", authMiddleware, async (req, res, next) => {
  try {
    const { reportId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // 1. Check if report exists and if user has access
    const reportCheck = await pool.query("SELECT user_id FROM reports WHERE id = $1", [reportId]);
    if (reportCheck.rows.length === 0) {
      throw new ApiError(404, "Report not found");
    }

    if (userRole !== "admin" && reportCheck.rows[0].user_id !== userId) {
      throw new ApiError(403, "You do not have permission to view comments for this report");
    }

    // 2. Fetch comments (Hide internal comments if user is not admin)
    let query = `
      SELECT c.*, u.email as user_email, u.role as user_role
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.report_id = $1
    `;
    const values = [reportId];

    if (userRole !== "admin") {
      query += " AND c.is_internal = FALSE ";
    }

    query += " ORDER BY c.created_at ASC";

    const comments = await pool.query(query, values);

    res.json({
      success: true,
      comments: comments.rows
    });
  } catch (err) {
    next(err);
  }
});

// Post a comment
router.post(
  "/:reportId",
  authMiddleware,
  [
    body("message").trim().notEmpty().withMessage("Message cannot be empty"),
    body("is_internal").optional().isBoolean().withMessage("is_internal must be a boolean"),
    validate
  ],
  async (req, res, next) => {
    try {
      const { reportId } = req.params;
      const { message, is_internal = false } = req.body;
      const userId = req.user.id;
      const userRole = req.user.role;

      // 1. Check access
      const reportCheck = await pool.query("SELECT user_id FROM reports WHERE id = $1", [reportId]);
      if (reportCheck.rows.length === 0) {
        throw new ApiError(404, "Report not found");
      }

      if (userRole !== "admin" && reportCheck.rows[0].user_id !== userId) {
        throw new ApiError(403, "You do not have permission to comment on this report");
      }

      // 2. Prevent researchers from posting internal comments
      const finalInternal = userRole === "admin" ? is_internal : false;

      // 3. Insert comment
      const newComment = await pool.query(
        "INSERT INTO comments (report_id, user_id, message, is_internal) VALUES ($1, $2, $3, $4) RETURNING *",
        [reportId, userId, message, finalInternal]
      );

      // 4. Log activity
      await logActivity(reportId, userId, "comment_added", { 
        is_internal: finalInternal 
      });

      res.status(201).json({
        success: true,
        comment: newComment.rows[0]
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
