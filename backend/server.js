import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import { pool, initDB } from "./db.js";
import authRoutes from "./routes/auth.js";
import reportRoutes from "./routes/reports.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
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
    next(err);
  }
});

// Feature Routes
app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(`[Error] ${err.message}`);
  res.status(500).json({ 
    success: false,
    error: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  await initDB();
});
