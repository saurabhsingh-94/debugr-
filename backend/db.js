import pkg from "pg";
const { Pool } = pkg;
import config from "./config/config.js";
import logger from "./utils/logger.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const pool = new Pool({
  connectionString: config.dbUrl,
  ssl: {
    rejectUnauthorized: false
  }
});

export const initDB = async () => {
  try {
    const sqlPath = path.join(__dirname, "init.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");
    await pool.query(sql);
    logger.info("✅ Database initialized successfully");
  } catch (err) {
    logger.error("❌ Database initialization failed: " + err.message);
    // Don't exit the process, let the server start even if DB fails initially
  }
};
