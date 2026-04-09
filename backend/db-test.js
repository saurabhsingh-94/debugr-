import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

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
    
    const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('📊 Tables found:', tables.rows.map(r => r.table_name));
    
  } catch (err) {
    console.error('❌ DB Connection Failed:', err.message);
  } finally {
    await pool.end();
  }
}

testConnection();
