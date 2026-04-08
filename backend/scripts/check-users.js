import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'debugr',
  password: 'password', // Defaulting to 'password' as per common local setups or previous context if any
  port: 5432,
});

async function checkUsers() {
  try {
    const res = await pool.query('SELECT email, handle FROM users');
    console.log('Users in DB:');
    console.table(res.rows);
  } catch (err) {
    console.error('Error checking users:', err.message);
  } finally {
    await pool.end();
  }
}

checkUsers();
