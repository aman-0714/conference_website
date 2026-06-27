// ============================================================
//  db.js  –  SQLite database setup for I-PESs 2027
// ============================================================

const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "ipess2027.db"));

// Enable WAL mode for better concurrency
db.pragma("journal_mode = WAL");

// ─── TABLE: paper_submissions ─────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS paper_submissions (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    paper_title TEXT    NOT NULL,
    abstract    TEXT    NOT NULL,
    track       TEXT    NOT NULL,   -- Track 1 | Track 2 | Track 3
    keywords    TEXT,
    -- Corresponding author
    author_name  TEXT NOT NULL,
    author_email TEXT NOT NULL,
    author_affiliation TEXT,
    author_country     TEXT,
    -- Co-authors (stored as JSON string)
    co_authors   TEXT DEFAULT '[]',
    -- File
    file_name   TEXT,               -- uploaded PDF filename on disk
    file_path   TEXT,
    -- Metadata
    cmt_id      TEXT,               -- Microsoft CMT paper ID (optional)
    status      TEXT DEFAULT 'submitted',  -- submitted | under_review | accepted | rejected | revision
    reviewer_comments TEXT,
    submitted_at TEXT DEFAULT (datetime('now')),
    updated_at   TEXT DEFAULT (datetime('now'))
  );
`);

// ─── TABLE: registrations ─────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS registrations (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name        TEXT NOT NULL,
    email            TEXT NOT NULL,
    phone            TEXT,
    affiliation      TEXT,
    designation      TEXT,          -- Student | Research Scholar | Faculty | Industry Professional
    country          TEXT,
    participation_mode TEXT NOT NULL, -- Online | Offline
    -- If registering for paper
    paper_id         INTEGER,       -- FK to paper_submissions (nullable)
    paper_title      TEXT,
    -- Registration category & fee
    category         TEXT NOT NULL, -- IEEE Member | Non-IEEE Member | Student | International
    amount           REAL NOT NULL,
    -- Payment
    payment_status   TEXT DEFAULT 'pending',  -- pending | paid | failed
    payment_ref      TEXT,          -- Transaction / UTR number
    payment_screenshot TEXT,        -- filename of uploaded screenshot
    -- Metadata
    status           TEXT DEFAULT 'pending',  -- pending | confirmed | cancelled
    registered_at    TEXT DEFAULT (datetime('now')),
    updated_at       TEXT DEFAULT (datetime('now'))
  );
`);

// ─── TABLE: contacts ──────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS contacts (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT NOT NULL,
    email      TEXT NOT NULL,
    subject    TEXT,
    message    TEXT NOT NULL,
    replied    INTEGER DEFAULT 0,  -- 0 = no, 1 = yes
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

// ─── TABLE: news ──────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS news (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    category   TEXT NOT NULL,
    content    TEXT NOT NULL,
    is_active  INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

// Seed initial news if empty
const newsCount = db.prepare("SELECT COUNT(*) as c FROM news").get();
if (newsCount.c === 0) {
  const insert = db.prepare(
    "INSERT INTO news (category, content) VALUES (?, ?)"
  );
  insert.run("ANNOUNCEMENT", "📢 Notification to Authors – Paper submission guidelines released.");
  insert.run("CALL FOR PAPERS", "📄 Call for Papers is now OPEN for I-PESs 2027.");
  insert.run("DEADLINE", "🗓️ Submission Deadline: 30th Jan 2027.");
  insert.run("FORMAT", "🎤 Hybrid Conference (Online + Offline Participation).");
  insert.run("SPONSORSHIP", "📍 IEEE Sponsored Conference (Subject to Approval).");
}

module.exports = db;
