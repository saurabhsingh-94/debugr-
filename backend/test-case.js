import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testCaseSensitivity() {
  try {
    console.log("--- Testing Case Sensitivity ---");
    
    // 1. Try different cases for email
    const emailBase = `test_case_${Date.now()}@example.com`;
    console.log(`Inserting: ${emailBase}`);
    await pool.query("INSERT INTO users (email, password, role) VALUES ($1, $2, $3)", [emailBase, "pass123", "hacker"]);

    const emailUpper = emailBase.toUpperCase();
    console.log(`Attempting duplicate with case change: ${emailUpper}`);
    try {
      await pool.query("INSERT INTO users (email, password, role) VALUES ($1, $2, $3)", [emailUpper, "pass123", "hacker"]);
      console.log("❌ ERROR: Duplicate email with different case succeeded!");
    } catch (err) {
      console.log(`✅ SUCCESS: Case-insensitive email failed (Wait, if success=failed, that implies it's case-insensitive? Or did Postgres do its magic?): ${err.message}`);
    }

    // 2. Try different cases for handle
    const handleBase = `Handle_${Date.now()}`;
    console.log(`Inserting handle: ${handleBase}`);
    await pool.query("INSERT INTO users (email, password, role, handle) VALUES ($1, $2, $3, $4)", [`email2_${Date.now()}@ex.com`, "pass123", "hacker", handleBase]);

    const handleLower = handleBase.toLowerCase();
     console.log(`Attempting duplicate handle with case change: ${handleLower}`);
    try {
      await pool.query("INSERT INTO users (email, password, role, handle) VALUES ($1, $2, $3, $4)", [`email3_${Date.now()}@ex.com`, "pass123", "hacker", handleLower]);
      console.log("❌ ERROR: Duplicate handle with different case succeeded!");
    } catch (err) {
      console.log(`✅ SUCCESS: Case-insensitive handle failed: ${err.message}`);
    }

  } catch (err) {
    console.error("Test failed:", err);
  } finally {
    await pool.end();
  }
}

testCaseSensitivity();
