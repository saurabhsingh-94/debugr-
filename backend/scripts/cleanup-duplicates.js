import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function cleanup() {
  try {
    console.log("--- Cleaning up case-insensitive duplicates ---");

    // Delete duplicate emails keeping the oldest one (smallest created_at)
    const emailResult = await pool.query(`
      DELETE FROM users a USING (
        SELECT MIN(created_at) as keep_time, LOWER(email) as lower_email
        FROM users
        GROUP BY LOWER(email)
        HAVING COUNT(*) > 1
      ) b
      WHERE LOWER(a.email) = b.lower_email
      AND a.created_at <> b.keep_time
      RETURNING id, email;
    `);

    console.log(`Deleted ${emailResult.rowCount} duplicate email rows.`);
    console.table(emailResult.rows);

    // Delete duplicate handles keeping the oldest one
    const handleResult = await pool.query(`
      DELETE FROM users a USING (
        SELECT MIN(created_at) as keep_time, LOWER(handle) as lower_handle
        FROM users
        WHERE handle IS NOT NULL
        GROUP BY LOWER(handle)
        HAVING COUNT(*) > 1
      ) b
      WHERE LOWER(a.handle) = b.lower_handle
      AND a.created_at <> b.keep_time
      RETURNING id, handle;
    `);

    console.log(`Deleted ${handleResult.rowCount} duplicate handle rows.`);
    console.table(handleResult.rows);

    console.log("Normalization complete.");

    console.log("\n--- Creating Unique Case-Insensitive Indexes ---");
    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_idx ON users (LOWER(email));
      CREATE UNIQUE INDEX IF NOT EXISTS users_handle_lower_idx ON users (LOWER(handle));
    `);
    console.log("Unique indexes created successfully.");

  } catch (err) {
    console.error("Error during cleanup:", err);
  } finally {
    await pool.end();
  }
}

cleanup();
