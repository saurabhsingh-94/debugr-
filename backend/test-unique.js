import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testUnique() {
  try {
    console.log("--- Testing Unique Constraints ---");
    
    // 1. Try to insert same email twice
    const email = "test_unique_" + Date.now() + "@example.com";
    console.log(`Inserting email: ${email}`);
    
    await pool.query("INSERT INTO users (email, password, role) VALUES ($1, $2, $3)", [email, "pass123", "hacker"]);
    console.log("First insertion success");

    try {
      console.log("Attempting duplicate insertion...");
      await pool.query("INSERT INTO users (email, password, role) VALUES ($1, $2, $3)", [email, "pass123", "hacker"]);
      console.log("❌ ERROR: Duplicate insertion succeeded!");
    } catch (err) {
      console.log(`✅ SUCCESS: Second insertion failed as expected: ${err.message}`);
    }

    // 2. Try to insert same handle twice
    const handle = "test_handle_" + Date.now();
    console.log(`Inserting handle: ${handle}`);
    
    await pool.query("INSERT INTO users (email, password, role, handle) VALUES ($1, $2, $3, $4)", ["another_" + email, "pass123", "hacker", handle]);
    console.log("First handle insertion success");

    try {
       console.log("Attempting duplicate handle insertion...");
       await pool.query("INSERT INTO users (email, password, role, handle) VALUES ($1, $2, $3, $4)", ["yet_another_" + email, "pass123", "hacker", handle]);
       console.log("❌ ERROR: Duplicate handle insertion succeeded!");
    } catch (err) {
      console.log(`✅ SUCCESS: Second handle insertion failed as expected: ${err.message}`);
    }

  } catch (err) {
    console.error("Test failed with error:", err);
  } finally {
    await pool.end();
  }
}

testUnique();
