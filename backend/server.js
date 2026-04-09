import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { pool, initDB } from "./db.js";
import authRoutes from "./routes/auth.js";
import reportRoutes from "./routes/reports.js";
import adminRoutes from "./routes/admin.js";
import commentRoutes from "./routes/comments.js";
import userRoutes from "./routes/users.js";
import programRoutes from "./routes/programs.js";
import paymentRoutes from "./routes/payments.js";
import logger from "./utils/logger.js";
import ApiError from "./utils/ApiError.js";

dotenv.config();

import config from "./config/config.js";

const app = express();

// Security & Performance Middleware
app.use(helmet());
app.use(compression());

// CORS with Whitelist from Config
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Check if the origin matches any allowed pattern or if no origin is provided (server-to-server)
    const isAllowed = !origin || config.corsWhitelist.some(allowed => {
      // Direct match
      if (allowed === origin) return true;
      // Also check for trailing slashes or www vs non-www if not already matched
      const sanitized = allowed.replace(/\/$/, "");
      return sanitized === origin;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      logger.warn(`[CORS Block] Blocked origin: ${origin}`);
      callback(new ApiError(403, `Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// Log Request Origin for debugging
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    logger.info(`[CORS Check] Incoming request from origin: ${origin}`);
  }
  next();
});

// Professional Logging (Morgan + Winston)
app.use(morgan("combined", { stream: { write: (message) => logger.info(message.trim()) } }));

// Rate Limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: "Too many requests from this IP, please try again after 15 minutes" }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Too many attempts, please try again later" }
});

app.use("/api/", generalLimiter);
app.use("/api/auth", authLimiter);
app.use("/api/reports", authLimiter);

// Routes
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    config: {
      env: config.env,
      cors: config.corsWhitelist.map(o => o.replace(/(?<=https?:\/\/[^/]+).*/, '')) // Sanitize for health output
    }
  });
});

app.get("/db-test", async (req, res, next) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ 
      success: true,
      time: result.rows[0].now 
    });
  } catch (err) {
    next(new ApiError(500, "Database connection error", false, err.stack));
  }
});

// Feature Routes
console.log('Registering Routes...');
app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/programs", programRoutes);
app.use("/api/payments", paymentRoutes);

// 404 Handler
app.use((req, res, next) => {
  next(new ApiError(404, "Route not found"));
});

// Global Error Handler
app.use((err, req, res, next) => {
  let { statusCode, message } = err;

  if (!err.isOperational) {
    statusCode = 500;
    message = "Internal Server Error";
    logger.error(`${err.message} - ${err.stack}`);
  } else {
    logger.warn(`${statusCode} - ${message}`);
  }

  res.status(statusCode || 500).json({ 
    success: false,
    error: message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  logger.info(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  await initDB();
});
