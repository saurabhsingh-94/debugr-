import { uploadToCloudinary } from "../utils/cloudinary.js";
import sendEmail from "../utils/mailer.js";

const router = express.Router();
// ... (omitting validation for brevity in replace)
// Report validation rules
const reportValidation = [
  body("title").trim().isLength({ min: 5, max: 200 }).withMessage("Title must be between 5 and 200 characters"),
  body("description").trim().isLength({ min: 20 }).withMessage("Description must be at least 20 characters"),
  body("severity").isIn(["low", "medium", "high", "critical"]).withMessage("Invalid severity level"),
  validate
];

// Create a new report (Authenticated) with optional Evidence Upload
router.post("/", authMiddleware, upload.single("evidence"), reportValidation, async (req, res, next) => {
  try {
    const { title, description, severity } = req.body;
    const userId = req.user.id;
    const userEmail = req.user.email;
    let evidence_url = null;

    // Handle file upload if present
    if (req.file) {
      try {
        evidence_url = await uploadToCloudinary(req.file.buffer);
      } catch (uploadErr) {
        console.error("Cloudinary Upload Error:", uploadErr);
        return res.status(500).json({ 
          error: "Failed to upload evidence to cloud", 
          details: uploadErr.message 
        });
      }
    }

    const newReport = await pool.query(
      "INSERT INTO reports (title, description, severity, user_id, evidence_url) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [title, description, severity, userId, evidence_url]
    );

    const report = newReport.rows[0];

    // Notification: Researcher confirmation
    await sendEmail(
      userEmail,
      `[Debugr] Bug Report Submitted: ${title}`,
      `Hi! We received your report "${title}". Our triage team is reviewing it. Current Status: ${report.status}`,
      `<h2>Report Confirmed</h2><p>Hi!</p><p>We received your report "<strong>${title}</strong>".</p><p>Status: <span style="color: blue;">${report.status}</span></p><p>Our triage team will review it soon.</p>`
    );

    res.status(201).json({
      success: true,
      report
    });
  } catch (err) {
    next(err);
  }
});

// List user's own reports (Authenticated)
router.get("/my-reports", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const reports = await pool.query(
      "SELECT * FROM reports WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );

    res.json({
      success: true,
      count: reports.rows.length,
      reports: reports.rows
    });
  } catch (err) {
    next(err);
  }
});

export default router;
