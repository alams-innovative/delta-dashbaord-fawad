-- Migration: Align users table with API expectations
-- Safe-guards to handle different existing schemas.

-- 1) Ensure created_at exists with default
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- 2) Ensure updated_at exists with default
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 3) If a 'password' column exists (old schema), rename it to 'password_hash'
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'password'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'password_hash'
  ) THEN
    ALTER TABLE users RENAME COLUMN password TO password_hash;
  END IF;
END $$;

-- 4) Ensure password_hash column exists
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- 5) Ensure role exists and has a default
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS role VARCHAR(50) NOT NULL DEFAULT 'staff';

-- 6) Ensure email unique index exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public' AND indexname = 'idx_users_email'
  ) THEN
    CREATE UNIQUE INDEX idx_users_email ON users(email);
  END IF;
END $$;

-- 7) Backfill updated_at if null
UPDATE users SET updated_at = NOW() WHERE updated_at IS NULL;
