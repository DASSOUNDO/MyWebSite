-- Tables de la mesure d'audience (générées depuis SCHEMA dans src/analytics.js)
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY, started_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, day TEXT NOT NULL,
    visitor TEXT, ref TEXT, referrer TEXT, country TEXT, city TEXT, org TEXT, device TEXT, lang TEXT,
    duration INTEGER DEFAULT 0, max_scroll INTEGER DEFAULT 0, sections TEXT DEFAULT '{}', events TEXT DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS sessions_started ON sessions (started_at);

CREATE TABLE IF NOT EXISTS chat (
    id INTEGER PRIMARY KEY AUTOINCREMENT, at INTEGER NOT NULL, session TEXT, mode TEXT,
    question TEXT, provider TEXT, ok INTEGER
);

CREATE INDEX IF NOT EXISTS chat_at ON chat (at);

CREATE TABLE IF NOT EXISTS applications (
    ref TEXT PRIMARY KEY, label TEXT NOT NULL, created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_failures (who TEXT NOT NULL, at INTEGER NOT NULL);

CREATE INDEX IF NOT EXISTS admin_failures_who ON admin_failures (who, at);
