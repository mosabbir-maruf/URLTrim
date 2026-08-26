-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'user', -- 'user' or 'admin'
  created_at INTEGER NOT NULL
);

-- Add user_id to links table to track ownership
-- We allow NULL so anonymous links can still exist
ALTER TABLE links ADD COLUMN user_id TEXT REFERENCES users(id);

-- Create an index to make fetching a user's links extremely fast
CREATE INDEX IF NOT EXISTS idx_links_user_id ON links(user_id);
