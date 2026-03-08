import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a SQLite database file called krishi.db
const dbPath = path.join(__dirname, 'krishi.db');
const db = new Database(dbPath);

// Create table called diary_entries
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS diary_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entry_text TEXT,
    date TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`;

db.exec(createTableQuery);

export default db;
