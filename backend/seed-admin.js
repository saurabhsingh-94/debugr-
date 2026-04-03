import { pool } from "./db.js";
import bcrypt from "bcryptjs";

const seedAdmin = async () => {
  try {
    const email = "admin@debugr.io";
    const password = "AdminPassword123";
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const check = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (check.rows.length === 0) {
      await pool.query(
        "INSERT INTO users (email, password, role) VALUES ($1, $2, $3)",
        [email, hashedPassword, "admin"]
      );
      console.log("✅ Admin user seeded: admin@debugr.io");
    } else {
      // Force update password to ensure test passes
      await pool.query(
        "UPDATE users SET password = $1, role = 'admin' WHERE email = $2",
        [hashedPassword, email]
      );
      console.log("✅ Admin user password updated: admin@debugr.io");
    }
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err.message);
    process.exit(1);
  }
};

seedAdmin();
