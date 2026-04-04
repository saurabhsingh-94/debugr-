-- Enable pgcrypto for UUID generation if not already enabled (optional)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'hacker',
    -- Unified profile fields
    name VARCHAR(255), -- Legal Name or Organization Name
    handle VARCHAR(100) UNIQUE, -- @handle for hackers
    specialization VARCHAR(100), -- Primary field (Web, Pwn, etc.)
    industry VARCHAR(100), -- For companies
    experience_level VARCHAR(50), -- For hackers (Beginner, Pro, etc.)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Reports table
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(50) CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'triaged', 'resolved', 'closed')),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
    bounty DECIMAL(10, 2) DEFAULT 0.00,
    admin_notes TEXT,
    evidence_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ensure columns exist for Day 3 & 4 (in case tables were already created)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reports' AND column_name='bounty') THEN
        ALTER TABLE reports ADD COLUMN bounty DECIMAL(10, 2) DEFAULT 0.00;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reports' AND column_name='admin_notes') THEN
        ALTER TABLE reports ADD COLUMN admin_notes TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reports' AND column_name='evidence_url') THEN
        ALTER TABLE reports ADD COLUMN evidence_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reports' AND column_name='program_id') THEN
        ALTER TABLE reports ADD COLUMN program_id UUID REFERENCES programs(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Create Comments table (Day 5)
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Activity Log table (Day 5)
CREATE TABLE IF NOT EXISTS activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Programs table (Directory)
CREATE TABLE IF NOT EXISTS programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'public' CHECK (type IN ('public', 'private')),
    logo_url VARCHAR(255),
    reward_min DECIMAL(10, 2) DEFAULT 0.00,
    reward_max DECIMAL(10, 2) DEFAULT 0.00,
    scope JSONB DEFAULT '[]',
    company_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Migrations for programs table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='programs' AND column_name='company_id') THEN
        ALTER TABLE programs ADD COLUMN company_id UUID REFERENCES users(id) ON DELETE SET NULL;
    END IF;

    -- New profile fields for users
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='handle') THEN
        ALTER TABLE users ADD COLUMN handle VARCHAR(100) UNIQUE;
        ALTER TABLE users ADD COLUMN name VARCHAR(255);
        ALTER TABLE users ADD COLUMN specialization VARCHAR(100);
        ALTER TABLE users ADD COLUMN industry VARCHAR(100);
        ALTER TABLE users ADD COLUMN experience_level VARCHAR(50);
    END IF;
END $$;

-- Insert some initial seed programs
INSERT INTO programs (name, description, type, reward_min, reward_max, scope)
VALUES 
('FinTech Corp', 'Secure the next generation of digital payments.', 'private', 500, 15000, '["Web", "Mobile", "API"]'),
('CloudNative Inc', 'Enterprise-grade cloud infrastructure security.', 'private', 1000, 25000, '["Infrastructure", "API"]'),
('ShopPlatform', 'Protecting millions of global transactions daily.', 'public', 100, 8000, '["Web", "Mobile"]'),
('DataSafe Ltd', 'Zero-trust data storage for heavily regulated industries.', 'private', 250, 12000, '["API", "Cloud"]')
ON CONFLICT DO NOTHING;
