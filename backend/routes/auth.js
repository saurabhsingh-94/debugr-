import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { body } from "express-validator";
import validate from "../middleware/validator.js";
import { pool } from "../db.js";
import ApiError from "../utils/ApiError.js";
import config from "../config/config.js";

const router = express.Router();
console.log("🔐 Auth routes initialized");

// Register validation rules
const registerValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Must be a valid email"),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
    .matches(/\d/).withMessage("Password must contain at least one number")
    .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter"),
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
    const { email, password } = req.body;

    // Check if user exists
    const userCheck = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userCheck.rows.length > 0) {
      throw new ApiError(400, "User already exists");
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    const newUser = await pool.query(
      "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email, role, created_at",
      [email, hashedPassword]
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
    const { email, password } = req.body;

    // Find user
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      throw new ApiError(401, "Invalid credentials");
    }

    const user = result.rows[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new ApiError(401, "Invalid credentials");
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: "24h" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
