import { pool } from "./db.js";

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log("Successfully connected to the database!");
    const res = await client.query("SELECT NOW()");
    console.log("Current time from database:", res.rows[0].now);
    client.release();
  } catch (err) {
    console.error("Error connecting to the database:", err.message);
  } finally {
    process.exit();
  }
}

testConnection();
