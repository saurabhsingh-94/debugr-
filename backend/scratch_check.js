import { pool } from './db.js';

async function check() {
  try {
    const query = `
      SELECT p.*, u.handle as seller_handle, u.avatar_url as seller_avatar
      FROM prompts p
      JOIN users u ON p.seller_id = u.id
      WHERE p.status = 'active'
    `;
    const res = await pool.query(query);
    console.log('Result length:', res.rows.length);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

check();
