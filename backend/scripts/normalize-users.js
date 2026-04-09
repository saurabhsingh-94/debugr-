import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function normalizeAndIndex() {
  try {
    console.log("--- Starting User Normalization & Case-Insensitive Indexing ---");

    // 1. Lowercase all existing emails and handles
    console.log("Normalizing existing emails and handles to lowercase...");
    await pool.query("UPDATE users SET email = LOWER(email), handle = LOWER(handle)");
    console.log("✅ Normalization complete.");

    // 2. Add case-insensitive unique indexes
    console.log("Adding case-insensitive unique indexes...");
    
    // First, drop old unique constraints if they exist (Postgres typically names them table_column_key)
    try {
      await pool.query("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key");
      await pool.query("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_handle_key");
    } catch (e) { console.log("Note: Could not drop constraints (they might not be named standardly):", e.message); }

    // Create the functional unique indexes
    await pool.query("CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_idx ON users (LOWER(email))");
    await pool.query("CREATE UNIQUE INDEX IF NOT EXISTS users_handle_lower_idx ON users (LOWER(handle))");
    
    console.log("✅ Case-insensitive unique indexes added.");

  } catch (err) {
    if (err.code === '23505') {
      console.error("❌ ERROR: Duplicate records found! You have accounts with the same email/handle (case-clashes). Please resolve them manually before running this script.");
    } else {
      console.error("❌ Error during script execution:", err);
    }
  } finally {
    await pool.end();
  }
}

normalizeAndIndex();
