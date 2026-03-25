import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = path.join(process.cwd(), "data", "sms.db");

// data/ papkasini yaratish
const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

const db = new Database(DB_PATH);

// Jadvallarni yaratish
db.exec(`
  CREATE TABLE IF NOT EXISTS contacts (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    name    TEXT    NOT NULL,
    phone   TEXT    NOT NULL UNIQUE,
    role    TEXT    DEFAULT '',
    color   TEXT    DEFAULT '#6c63ff',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS sms_logs (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    contact_id INTEGER REFERENCES contacts(id),
    phone      TEXT NOT NULL,
    message    TEXT NOT NULL,
    sent_at    TEXT DEFAULT (datetime('now'))
  );
`);

export default db;
