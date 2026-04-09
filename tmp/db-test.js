import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config({ path: 'C:/Projects/New_one/new_project_bugBounty/backend/.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function testConnection() {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('✅ DB Connection Successful:', res.rows[0]);
  } catch (err) {
    console.error('❌ DB Connection Failed:', err.message);
  } finally {
    await pool.end();
  }
}

testConnection();
