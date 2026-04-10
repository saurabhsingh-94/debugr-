import express from "express";
import { pool } from "../db.js";
import authMiddleware from "../middleware/auth.js";
import ApiError from "../utils/ApiError.js";
import { encrypt } from "../utils/encryption.js";
import logger from "../utils/logger.js";

const router = express.Router();

/**
 * @route   POST /api/payouts/method
 * @desc    Save/Update payout method (Encrypted)
 * @access  Private (Hacker only)
 */
router.post("/method", authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { type, bank_account, ifsc, upi_id, name } = req.body;

        if (!type || (type === 'bank_account' && (!bank_account || !ifsc)) || (type === 'upi' && !upi_id)) {
            throw new ApiError(400, "Missing required payout details");
        }

        // Prepare data to encrypt
        const payoutData = type === 'bank_account' 
            ? { account_number: bank_account, ifsc, name }
            : { upi_id, name };

        const encryptedString = encrypt(JSON.stringify(payoutData));
        const [iv, authTag, encryptedData] = encryptedString.split(':');

        // Upsert payout method
        await pool.query(
            `INSERT INTO payout_methods (user_id, type, encrypted_data, iv, auth_tag)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (user_id, type) 
             DO UPDATE SET 
                encrypted_data = EXCLUDED.encrypted_data,
                iv = EXCLUDED.iv,
                auth_tag = EXCLUDED.auth_tag,
                created_at = CURRENT_TIMESTAMP`,
            [userId, type, encryptedData, iv, authTag]
        );

        res.json({
            success: true,
            message: `Payout method (${type}) saved securely.`
        });
    } catch (err) {
        next(err);
    }
});

/**
 * @route   GET /api/payouts/method
 * @desc    Get user's payout methods (Masked)
 * @access  Private
 */
router.get("/method", authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user.id;
        const result = await pool.query(
            "SELECT type, created_at FROM payout_methods WHERE user_id = $1",
            [userId]
        );

        res.json({
            success: true,
            methods: result.rows
        });
    } catch (err) {
        next(err);
    }
});

/**
 * @route   POST /api/payouts/request
 * @desc    Request a withdrawal (Manual review)
 * @access  Private
 */
router.post("/request", authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { amount } = req.body;

        if (!amount || amount < 1000) {
            throw new ApiError(400, "Minimum withdrawal limit is ₹1,000");
        }

        // 1. Verify user has enough balance
        const balanceResult = await pool.query(`
            SELECT COALESCE(SUM(amount), 0) as balance 
            FROM transactions 
            WHERE user_id = $1 AND status = 'completed'
        `, [userId]);

        const currentBalance = parseFloat(balanceResult.rows[0].balance);
        if (currentBalance < amount) {
            throw new ApiError(400, "Insufficient balance in wallet");
        }

        // 2. Check if user has a payout method
        const methodCheck = await pool.query("SELECT id FROM payout_methods WHERE user_id = $1 LIMIT 1", [userId]);
        if (methodCheck.rows.length === 0) {
            throw new ApiError(400, "Please add a payout method in settings first");
        }

        // 3. Create withdrawal request
        const withdrawal = await pool.query(
            `INSERT INTO withdrawal_requests (user_id, amount, status)
             VALUES ($1, $2, 'pending')
             RETURNING id, amount, status, created_at`,
            [userId, amount]
        );

        // 4. Record a "Hold" or "Debit" transaction
        await pool.query(
            `INSERT INTO transactions (user_id, type, amount, status, reference_id, details)
             VALUES ($1, 'payout', $2, 'pending', $3, $4)`,
            [userId, -amount, `withdraw_${withdrawal.rows[0].id}`, JSON.stringify({ type: 'withdrawal_request' })]
        );

        res.json({
            success: true,
            message: "Withdrawal request submitted for review.",
            withdrawal: withdrawal.rows[0]
        });
    } catch (err) {
        next(err);
    }
});

/**
 * @route   GET /api/payouts/history
 * @desc    Get user withdrawal history
 * @access  Private
 */
router.get("/history", authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user.id;
        const result = await pool.query(
            "SELECT * FROM withdrawal_requests WHERE user_id = $1 ORDER BY created_at DESC",
            [userId]
        );

        res.json({
            success: true,
            history: result.rows
        });
    } catch (err) {
        next(err);
    }
});

export default router;
