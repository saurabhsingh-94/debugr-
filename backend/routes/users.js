import express from "express";
import { pool } from "../db.js";
import authMiddleware from "../middleware/auth.js";
import ApiError from "../utils/ApiError.js";

import cache from "../middleware/cache.js";
import redis from "../utils/redis.js";

const router = express.Router();

// Get the current user's profile and stats (Cached for 30s)
router.get("/profile/me", authMiddleware, cache(30), async (req, res, next) => {
  try {
    const userId = req.user.id;

    // 1. Get basic info
    const userResult = await pool.query(
      "SELECT id, email, role, created_at FROM users WHERE id = $1",
      [userId]
    );

    if (userResult.rows.length === 0) {
      throw new ApiError(404, "User not found");
    }

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

// Get global leaderboard (Top researchers by bounty earned)
// Uses Redis Sorted Set for O(log N) ranking
router.get("/leaderboard", cache(60), async (req, res, next) => {
  const REDIS_KEY = "leaderboard:global";
  
  try {
    // 1. Try to get from Redis
    if (redis) {
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

    // 2. Fallback to SQL if Redis is empty or down
    const query = `
      SELECT u.id, u.email, COALESCE(SUM(r.bounty), 0) as total_earned, COUNT(r.id) as resolved_count
      FROM users u
      LEFT JOIN reports r ON u.id = r.user_id AND r.status = 'resolved'
      WHERE u.role = 'researcher'
      GROUP BY u.id, u.email
      HAVING SUM(r.bounty) > 0
      ORDER BY total_earned DESC
      LIMIT 10
    `;

    const result = await pool.query(query);
    
    // 3. Proactively seed Redis if it was empty
    if (redis && result.rows.length > 0) {
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

export default router;
