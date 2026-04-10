import { pool } from './db.js';

const target = process.argv[2];

if (!target) {
    console.error('Usage: node promote.js <email_or_handle>');
    process.exit(1);
}

async function promote() {
    try {
        const result = await pool.query(
            "UPDATE users SET role = 'admin' WHERE email = $1 OR handle = $1 RETURNING email, handle, role",
            [target]
        );

        if (result.rows.length === 0) {
            console.log(`❌ User "${target}" not found.`);
        } else {
            console.log(`✅ Success! ${result.rows[0].email} is now an admin.`);
        }
    } catch (err) {
        console.error('❌ Error during promotion:', err.message);
    } finally {
        process.exit();
    }
}

promote();
