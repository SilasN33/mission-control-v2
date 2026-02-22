import Database from 'better-sqlite3';
import path from 'path';

const dbPath = process.env.DB_PATH || path.join(process.cwd(), 'dev.db');
const db = new Database(dbPath);

// Create tables on startup
db.exec(`
  CREATE TABLE IF NOT EXISTS agents (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    systemPrompt TEXT NOT NULL,
    model TEXT NOT NULL,
    maxTokens INTEGER DEFAULT 2000,
    historyLimit INTEGER DEFAULT 10,
    ttlMinutes INTEGER DEFAULT 60,
    toolsAllowed TEXT DEFAULT '',
    createdAt TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS runs (
    id TEXT PRIMARY KEY,
    agentId TEXT NOT NULL,
    status TEXT NOT NULL,
    duration INTEGER,
    costEstimate REAL,
    input TEXT,
    createdAt TEXT DEFAULT (datetime('now'))
  );
`);

export default db;
