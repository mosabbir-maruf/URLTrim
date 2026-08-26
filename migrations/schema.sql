CREATE TABLE links (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    original_url TEXT NOT NULL,
    clicks INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL,
    expires_at INTEGER,
    is_active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  created_at INTEGER NOT NULL,
  is_verified INTEGER NOT NULL DEFAULT 0,
  verification_token TEXT
);

ALTER TABLE links ADD COLUMN user_id TEXT REFERENCES users(id);

CREATE INDEX IF NOT EXISTS idx_links_user_id ON links(user_id);
