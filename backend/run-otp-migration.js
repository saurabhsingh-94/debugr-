import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
    try {
        const sqlPath = path.join(process.cwd(), 'db', 'migrations', 'otp_security.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        console.log('🚀 Running migration: otp_security.sql');
        await pool.query(sql);
        console.log('✅ Migration successful!');
        
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
    } finally {
        await pool.end();
    }
}

runMigration();
