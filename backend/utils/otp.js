import { pool } from '../db.js';
import crypto from 'crypto';

/**
 * Generates a 6-digit numeric OTP and stores it in the database.
 * @param {string} email - Recipient email
 * @param {string} type - 'signup' or 'login'
 * @returns {string} The generated OTP code
 */
export const generateOTP = async (email, type) => {
    // Generate 6-digit code
    const otp = crypto.randomInt(100000, 999999).toString();
    
    // Set expiry (60 seconds as requested)
    const expiresAt = new Date(Date.now() + 60 * 1000);

    // Delete any existing codes for this email/type to avoid clutter
    await pool.query(
        "DELETE FROM otp_verifications WHERE email = $1 AND type = $2",
        [email.toLowerCase(), type]
    );

    // Store new code
    await pool.query(
        "INSERT INTO otp_verifications (email, otp_code, type, expires_at) VALUES ($1, $2, $3, $4)",
        [email.toLowerCase(), otp, type, expiresAt]
    );

    return otp;
};

/**
 * Verifies an OTP code and deletes it if valid.
 * @param {string} email 
 * @param {string} type 
 * @param {string} code 
 * @returns {boolean} True if valid
 */
export const verifyOTP = async (email, type, code) => {
    const result = await pool.query(
        "SELECT * FROM otp_verifications WHERE LOWER(email) = LOWER($1) AND type = $2 AND otp_code = $3 AND expires_at > CURRENT_TIMESTAMP",
        [email, type, code]
    );

    if (result.rows.length > 0) {
        // Code is valid, consume it
        await pool.query("DELETE FROM otp_verifications WHERE id = $1", [result.rows[0].id]);
        return true;
    }

    return false;
};
