CREATE TABLE links (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    original_url TEXT NOT NULL,
    clicks INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL,
    expires_at INTEGER,
    is_active INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_links_code ON links(code);
