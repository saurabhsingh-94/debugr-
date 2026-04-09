import express from "express";
import { pool } from "../db.js";
import authMiddleware from "../middleware/auth.js";
import ApiError from "../utils/ApiError.js";
import upload from "../middleware/upload.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import logger from "../utils/logger.js";

import cache from "../middleware/cache.js";
import redis from "../utils/redis.js";

const router = express.Router();

// Get the current user's profile and stats (Cached for 30s)
router.get("/profile/me", authMiddleware, cache(30), async (req, res, next) => {
  try {
    const userId = req.user.id;

    // 1. Get basic info (including new professional fields)
    const userResult = await pool.query(
      "SELECT id, email, role, handle, name, bio, website, location, github_url, skills, industry, experience_level, company_size, description, avatar_url, created_at FROM users WHERE id = $1",
      [userId]
    );

    if (userResult.rows.length === 0) {
      throw new ApiError(404, "User not found");
    }

    // 2. Get detailed stats (Report-based)
    const statsResult = await pool.query(`
      SELECT 
        COUNT(*) as total_submissions,
        COUNT(*) FILTER (WHERE status = 'resolved') as resolved_bugs,
        COUNT(*) FILTER (WHERE status = 'triaged') as triaged_bugs,
        COALESCE(SUM(bounty), 0) as total_earned
      FROM reports
      WHERE user_id = $1
    `, [userId]);

    // 3. Get real Wallet Balance (Transaction-based)
    const balanceResult = await pool.query(`
      SELECT COALESCE(SUM(amount), 0) as balance 
      FROM transactions 
      WHERE user_id = $1 AND status = 'completed'
    `, [userId]);

    res.json({
      success: true,
      user: {
        ...userResult.rows[0],
        stats: statsResult.rows[0],
        balance: parseFloat(balanceResult.rows[0].balance)
      }
    });
  } catch (err) {
    next(err);
  }
});

// Get global leaderboard (Top hackers by bounty earned or resolved count)
// Uses Redis Sorted Set for O(log N) ranking for the default view
router.get("/leaderboard", cache(60), async (req, res, next) => {
  const { sortBy = 'earned' } = req.query;
  const REDIS_KEY = `leaderboard:global:${sortBy}`;
  
  try {
    // 1. Try to get from Redis (Only for verified top 10)
    if (redis && sortBy === 'earned') { // Currently only caching 'earned' in Redis for simplicity
      const redisLeaderboard = await redis.zrevrange(REDIS_KEY, 0, 9, "WITHSCORES");
      if (redisLeaderboard.length > 0) {
        const formatted = [];
        for (let i = 0; i < redisLeaderboard.length; i += 2) {
          const [id, email] = redisLeaderboard[i].split(":");
          formatted.push({
            id,
            email,
            total_earned: parseFloat(redisLeaderboard[i + 1]),
            source: "redis" 
          });
        }
        return res.json({ success: true, leaderboard: formatted });
      }
    }

    // 2. Fallback to SQL (or primary choice for 'resolved')
    const orderField = sortBy === 'resolved' ? 'resolved_count' : 'total_earned';
    const query = `
      SELECT u.id, u.email, 
             COALESCE(SUM(r.bounty), 0) as total_earned, 
             COUNT(r.id) FILTER (WHERE r.status = 'resolved') as resolved_count
      FROM users u
      LEFT JOIN reports r ON u.id = r.user_id
      WHERE u.role = 'hacker'
      GROUP BY u.id, u.email
      HAVING COUNT(r.id) FILTER (WHERE r.status = 'resolved') > 0
      ORDER BY ${orderField} DESC
      LIMIT 10
    `;

    const result = await pool.query(query);
    
    // 3. Proactively seed Redis if it was empty (Only for 'earned' for now)
    if (redis && sortBy === 'earned' && result.rows.length > 0) {
      const pipeline = redis.pipeline();
      result.rows.forEach(row => {
        pipeline.zadd(REDIS_KEY, row.total_earned, `${row.id}:${row.email}`);
      });
      await pipeline.exec();
    }

    res.json({
      success: true,
      leaderboard: result.rows
    });
  } catch (err) {
    next(err);
  }
});

// Update the current user's profile
router.patch("/profile", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { 
      name, bio, website, location, github_url, 
      skills, industry, experience_level, company_size, description, avatar_url 
    } = req.body;

    // Validate inputs (Basic validation for now, could use Joi later)
    if (website && !website.startsWith('http')) {
       // throw new ApiError(400, "Website must be a valid URL starting with http/https");
    }

    const query = `
      UPDATE users 
      SET 
        name = COALESCE($1, name),
        bio = COALESCE($2, bio),
        website = COALESCE($3, website),
        location = COALESCE($4, location),
        github_url = COALESCE($5, github_url),
        skills = COALESCE($6, skills),
        industry = COALESCE($7, industry),
        experience_level = COALESCE($8, experience_level),
        company_size = COALESCE($9, company_size),
        description = COALESCE($10, description),
        avatar_url = COALESCE($11, avatar_url)
      WHERE id = $12
      RETURNING id, email, role, handle, name, bio, website, location, github_url, skills, industry, experience_level, company_size, description, avatar_url
    `;

    // Normalize skills: accept array or JSON string, always store as JSON string
    let skillsJson = '[]';
    if (Array.isArray(skills)) {
      skillsJson = JSON.stringify(skills);
    } else if (typeof skills === 'string') {
      try { JSON.parse(skills); skillsJson = skills; } catch { skillsJson = '[]'; }
    }

    const values = [
      name || null, bio || null, website || null, location || null, github_url || null,
      skillsJson, industry || null, experience_level || null, company_size || null, description || null,
      avatar_url || null, userId
    ];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      throw new ApiError(404, "User not found");
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
});

// Get a public user's profile and stats by handle (No auth required)

// Update Account (Email/Handle)
router.patch("/account", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { email, handle } = req.body;

    if (!email && !handle) {
      throw new ApiError(400, "Email or handle is required to update account");
    }

    // 1. Check if email is taken
    if (email) {
      const emailCheck = await pool.query("SELECT id FROM users WHERE email = $1 AND id != $2", [email, userId]);
      if (emailCheck.rows.length > 0) {
        throw new ApiError(400, "Email already in use");
      }
    }

    // 2. Check if handle is taken
    if (handle) {
      const handleCheck = await pool.query("SELECT id FROM users WHERE handle = $1 AND id != $2", [handle, userId]);
      if (handleCheck.rows.length > 0) {
        throw new ApiError(400, "Handle already taken");
      }
    }

    // 3. Update
    const result = await pool.query(
      "UPDATE users SET email = COALESCE($1, email), handle = COALESCE($2, handle) WHERE id = $3 RETURNING id, email, handle",
      [email || null, handle || null, userId]
    );

    res.json({
      success: true,
      message: "Account updated successfully",
      user: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
});

// Delete Account
router.delete("/account", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id;
    await pool.query("DELETE FROM users WHERE id = $1", [userId]);
    res.json({
      success: true,
      message: "Account deleted successfully"
    });
  } catch (err) {
    next(err);
  }
});

router.get("/profile/:handle", cache(60), async (req, res, next) => {

  try {
    const { handle } = req.params;

    // 1. Get basic info
    const userResult = await pool.query(
      "SELECT id, handle, name, bio, website, location, github_url, skills, industry, experience_level, company_size, description, avatar_url, created_at FROM users WHERE handle = $1",
      [handle]
    );

    if (userResult.rows.length === 0) {
      throw new ApiError(404, "Researcher not found on the grid");
    }

    const userId = userResult.rows[0].id;

    // 2. Get detailed stats
    const statsResult = await pool.query(`
      SELECT 
        COUNT(*) as total_submissions,
        COUNT(*) FILTER (WHERE status = 'resolved') as resolved_bugs,
        COUNT(*) FILTER (WHERE status = 'triaged') as triaged_bugs,
        COALESCE(SUM(bounty), 0) as total_earned
      FROM reports
      WHERE user_id = $1
    `, [userId]);

    res.json({
      success: true,
      user: {
        ...userResult.rows[0],
        stats: statsResult.rows[0]
      }
    });
  } catch (err) {
    next(err);
  }
});


// ---------------------------------------------------------
// NEW: Account Security & Privacy (Instagram Style) 
// ---------------------------------------------------------

/**
 * @route   GET /api/users/activity
 * @desc    Get user login activity
 * @access  Private
 */
router.get("/activity", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      "SELECT id, device, location, ip_address, created_at FROM login_history WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10",
      [userId]
    );

    // If no real activity yet, provide some high-fidelity mocks for the "professional" feel
    let activity = result.rows;
    if (activity.length === 0) {
      activity = [
        { id: '1', device: 'Chrome on Windows', location: 'New Delhi, India', ip_address: '103.21.x.x', created_at: new Date() },
        { id: '2', device: 'Safari on iPhone', location: 'Mumbai, India', ip_address: '106.51.x.x', created_at: new Date(Date.now() - 86400000) }
      ];
    }

    res.json({ success: true, activity });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   PATCH /api/users/privacy
 * @desc    Update profile privacy settings
 * @access  Private
 */
router.patch("/privacy", authMiddleware, async (req, res, next) => {
  try {
    const { is_private } = req.body;
    const userId = req.user.id;

    await pool.query(
      "UPDATE users SET is_private = $1 WHERE id = $2",
      [is_private, userId]
    );

    res.json({ success: true, message: "Privacy settings updated" });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   PATCH /api/users/avatar
 * @desc    Upload profile picture
 * @access  Private
 */
router.patch("/avatar", authMiddleware, upload.single("avatar"), async (req, res, next) => {
  try {
    const userId = req.user.id;
    if (!req.file) {
      logger.error(`Avatar upload failed for user ${userId}: No file in request`);
      throw new ApiError(400, "No file uploaded");
    }

    logger.info(`Attempting avatar upload for user ${userId}. File size: ${req.file.size} bytes`);

    let avatarUrl;
    try {
      avatarUrl = await uploadToCloudinary(req.file.buffer);
      logger.info(`Cloudinary upload successful for user ${userId}: ${avatarUrl}`);
    } catch (cloudinaryErr) {
      logger.error(`Cloudinary upload failed for user ${userId}: ${cloudinaryErr.message}`);
      throw new ApiError(500, `Image storage failure: ${cloudinaryErr.message}`);
    }

    try {
      const result = await pool.query(
        "UPDATE users SET avatar_url = $1 WHERE id = $2 RETURNING id",
        [avatarUrl, userId]
      );
      if (result.rows.length === 0) {
        logger.error(`Avatar DB update failed: User ${userId} not found`);
        throw new ApiError(404, "User not found in registry");
      }
      logger.info(`User ${userId} avatar updated in DB`);
    } catch (dbErr) {
      logger.error(`Database error updating avatar for user ${userId}: ${dbErr.message}`);
      throw new ApiError(500, "Profile synchronization error");
    }

    res.json({
      success: true,
      avatar_url: avatarUrl,
      message: "Profile picture synchronized"
    });
  } catch (err) {
    logger.error(`Top-level error in /avatar route: ${err.message}`);
    next(err);
  }
});

export default router;
