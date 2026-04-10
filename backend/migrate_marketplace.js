import { pool } from "./db.js";
import logger from "./utils/logger.js";

async function migrate() {
  try {
    logger.info("Starting Marketplace migration...");

    // 1. Create prompts table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS prompts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(100) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        commission_rate DECIMAL(5, 2) DEFAULT 20.00,
        content TEXT NOT NULL, -- The actual prompt instructions
        proof_urls JSONB DEFAULT '[]', -- Array of Cloudinary links
        status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'under_review')),
        avg_rating DECIMAL(3, 2) DEFAULT 0.00,
        likes_count INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    logger.info("✓ Prompts table created");

    // 2. Create marketplace_likes table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS marketplace_likes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(prompt_id, user_id)
      )
    `);
    logger.info("✓ Marketplace likes table created");

    // 3. Create marketplace_comments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS marketplace_comments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    logger.info("✓ Marketplace comments table created");

    // 4. Create prompt_purchases table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS prompt_purchases (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        prompt_id UUID REFERENCES prompts(id) ON DELETE SET NULL,
        buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
        amount_paid DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'USD',
        transaction_id UUID REFERENCES transactions(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    logger.info("✓ Prompt purchases table created");

    logger.info("Marketplace migration completed successfully.");
    process.exit(0);
  } catch (err) {
    logger.error("Migration failed:", err);
    process.exit(1);
  }
}

migrate();
