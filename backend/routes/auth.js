import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { body } from "express-validator";
import validate from "../middleware/validator.js";
import { pool } from "../db.js";
import ApiError from "../utils/ApiError.js";
import config from "../config/config.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();
console.log("🔐 Auth routes initialized");

// Register validation rules
const registerValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Must be a valid email"),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
    .matches(/\d/).withMessage("Password must contain at least one number")
    .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter"),
  body("role").isIn(["hacker", "company"]).withMessage("Role must be 'hacker' or 'company'"),
  // Optional profile fields for Step 3
  body("name").optional().trim().isLength({ max: 255 }),
  body("handle").optional().trim().isLength({ max: 100 }),
  body("specialization").optional().trim().isLength({ max: 100 }),
  body("industry").optional().trim().isLength({ max: 100 }),
  body("experience_level").optional().trim().isLength({ max: 50 }),
  body("bio").optional().trim().isLength({ max: 1000 }),
  body("website").optional().trim().isURL().withMessage("Must be a valid URL"),
  body("location").optional().trim().isLength({ max: 100 }),
  body("github_url").optional().trim().isURL().withMessage("Must be a valid GitHub URL"),
  body("skills").optional().isArray(),
  body("company_size").optional().trim().isLength({ max: 50 }),
  body("description").optional().trim().isLength({ max: 2000 }),
  validate
];

// Login validation rules
const loginValidation = [
  body("email").isEmail().withMessage("Must be a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
  validate
];

// Register
router.post("/register", registerValidation, async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    // Check if user exists
    const userCheck = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userCheck.rows.length > 0) {
      throw new ApiError(400, "Email already registered");
    }

    // Check if handle is taken
    const { handle } = req.body;
    if (handle) {
      const handleCheck = await pool.query("SELECT * FROM users WHERE handle = $1", [handle]);
      if (handleCheck.rows.length > 0) {
        throw new ApiError(400, "Handle is already taken");
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user with profile fields
    const { 
      name, specialization, industry, experience_level,
      bio, website, location, github_url, skills, company_size, description
    } = req.body;
    
    const newUser = await pool.query(
      `INSERT INTO users (
        email, password, role, name, handle, specialization, industry, experience_level,
        bio, website, location, github_url, skills, company_size, description
      ) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) 
       RETURNING id, email, role, handle, created_at`,
      [
        email, hashedPassword, role, name, handle, specialization, industry, experience_level,
        bio, website, location, github_url, JSON.stringify(skills || []), company_size, description
      ]
    );

    res.status(201).json({
      success: true,
      user: newUser.rows[0]
    });
  } catch (err) {
    next(err);
  }
});

// Login
router.post("/login", loginValidation, async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Find user by email OR handle
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1 OR handle = $2", 
      [username, username]
    );

    if (result.rows.length === 0) {
      throw new ApiError(401, "Invalid credentials");
    }

    const user = result.rows[0];

    // Check password if provided
    if (password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new ApiError(401, "Invalid credentials");
      }
    } else {
      // If password not provided, allow login (Frictionless mode requested)
      console.log(`🔓 Frictionless login for user: ${user.handle || user.email}`);
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, handle: user.handle },
      config.jwtSecret,
      { expiresIn: "24h" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        handle: user.handle,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
});


// Change Password
router.patch("/change-password", authMiddleware, async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!oldPassword || !newPassword) {
      throw new ApiError(400, "Old and new passwords are required");
    }

    if (newPassword.length < 8) {
      throw new ApiError(400, "New password must be at least 8 characters");
    }

    // 1. Get user with password
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [userId]);
    const user = result.rows[0];

    // 2. Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new ApiError(400, "Incorrect current password");
    }

    // 3. Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 4. Update
    await pool.query("UPDATE users SET password = $1 WHERE id = $2", [hashedPassword, userId]);

    res.json({
      success: true,
      message: "Password updated successfully"
    });
  } catch (err) {
    next(err);
  }
});

export default router;

