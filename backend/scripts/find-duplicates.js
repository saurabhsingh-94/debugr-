import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function findDuplicates() {
  try {
    console.log("--- Identifying Case-Sensitive Duplicates ---");

    const emailDups = await pool.query(`
      SELECT LOWER(email) as lower_email, COUNT(*) 
      FROM users 
      GROUP BY LOWER(email) 
      HAVING COUNT(*) > 1
    `);

    const handleDups = await pool.query(`
      SELECT LOWER(handle) as lower_handle, COUNT(*) 
      FROM users 
      WHERE handle IS NOT NULL
      GROUP BY LOWER(handle) 
      HAVING COUNT(*) > 1
    `);

    console.log("\nDuplicate Emails:");
    console.table(emailDups.rows);

    console.log("\nDuplicate Handles:");
    console.table(handleDups.rows);

    if (emailDups.rows.length === 0 && handleDups.rows.length === 0) {
      console.log("No strictly case-sensitive duplicates found in counts, checking specific rows...");
    }

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await pool.end();
  }
}

findDuplicates();
