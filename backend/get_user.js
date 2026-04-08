import { pool } from './db.js';

async function getUsers() {
  try {
    const res = await pool.query('SELECT handle FROM users WHERE handle IS NOT NULL LIMIT 1');
    console.log('TEST_USER_HANDLE:', res.rows[0]?.handle);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

getUsers();
