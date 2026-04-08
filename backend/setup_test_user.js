import { pool } from './db.js';
import bcrypt from 'bcryptjs';

async function setup() {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash('Hacker123!', salt);
    
    // Check if user exists
    const check = await pool.query("SELECT * FROM users WHERE email = 'hacker@debugr.tst'");
    if (check.rows.length === 0) {
      await pool.query(
        "INSERT INTO users (email, password, role, handle, name) VALUES ('hacker@debugr.tst', $1, 'hacker', 'hacker0x1', 'Hacker One')",
        [hashed]
      );
      console.log('✅ User hacker@debugr.tst created');
    } else {
      console.log('ℹ️ User hacker@debugr.tst already exists');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error setup:', err);
    process.exit(1);
  }
}

setup();
