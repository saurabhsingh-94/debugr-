import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { pool, initDB } from "./db.js";
import authRoutes from "./routes/auth.js";
import reportRoutes from "./routes/reports.js";
import adminRoutes from "./routes/admin.js";

dotenv.config();

const app = express();

// Security & Performance Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Rate Limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: "Too many requests from this IP, please try again after 15 minutes" }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // Stricter limit for auth & reports
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
app.use("/api/admin", adminRoutes);

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
