import { pool } from "../db.js";

const migrate = async () => {
    try {
        console.log("Checking for 'avatar_url' column in 'users' table...");
        const res = await pool.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='avatar_url') THEN
                    ALTER TABLE users ADD COLUMN avatar_url VARCHAR(255);
                    RAISE NOTICE 'Column avatar_url added to users table.';
                ELSE
                    RAISE NOTICE 'Column avatar_url already exists.';
                END IF;
            END $$;
        `);
        console.log("✅ Migration successful.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Migration failed:", err.message);
        process.exit(1);
    }
};

migrate();
