import { pool } from "./db.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runMigration = async () => {
    try {
        const sql = fs.readFileSync(path.join(__dirname, "init.sql"), "utf8");
        await pool.query(sql);
        console.log("✅ Migration successful");
        
        // Verify columns
        const reportCols = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name='reports'");
        const programCols = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name='programs'");
        
        console.log("Reports columns:", reportCols.rows.map(r => r.column_name).join(", "));
        console.log("Programs columns:", programCols.rows.map(r => r.column_name).join(", "));
        
        process.exit(0);
    } catch (err) {
        console.error("❌ Migration failed:", err.message);
        process.exit(1);
    }
};

runMigration();
