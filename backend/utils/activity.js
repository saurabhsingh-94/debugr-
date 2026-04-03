import { pool } from "../db.js";
import logger from "./logger.js";

/**
 * Logs an activity to the database activity_log table
 * @param {string} reportId - The ID of the bug report
 * @param {string} userId - The ID of the user performing the action
 * @param {string} action - Descriptive action (e.g., 'status_changed', 'comment_added')
 * @param {object} details - JSON object with additional details (old_value, new_value, etc.)
 */
export const logActivity = async (reportId, userId, action, details = {}) => {
  try {
    const query = `
      INSERT INTO activity_log (report_id, user_id, action, details)
      VALUES ($1, $2, $3, $4)
      RETURNING id;
    `;
    const values = [reportId, userId, action, JSON.stringify(details)];
    await pool.query(query, values);
    
    logger.info(`📝 Activity Logged [${action}] on report ${reportId} by user ${userId}`);
  } catch (err) {
    logger.error(`❌ Failed to log activity: ${err.message}`);
    // We don't throw here to avoid failing the main request if logging fails
  }
};

export default { logActivity };
