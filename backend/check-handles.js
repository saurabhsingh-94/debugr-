import pkg from "pg";
const { Pool } = pkg;
import config from "./config/config.js";

const pool = new Pool({
  connectionString: config.dbUrl,
  ssl: { rejectUnauthorized: false }
});

async function checkHandles() {
  try {
    const res = await pool.query("SELECT handle FROM users LIMIT 10;");
    console.log("HANDLES:", res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

checkHandles();
