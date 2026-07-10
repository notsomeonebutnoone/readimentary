import path from 'node:path';
import fs from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import crypto from 'node:crypto';

const dataDir = process.env.DATA_DIR || path.resolve('data');
fs.mkdirSync(dataDir, { recursive: true });
export const db = new DatabaseSync(path.join(dataDir, 'readimentary.db'));
db.exec('PRAGMA journal_mode = WAL');
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, password_hash TEXT,
    provider TEXT NOT NULL DEFAULT 'email', provider_id TEXT,
    is_paid INTEGER NOT NULL DEFAULT 0, stripe_customer_id TEXT,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS books (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL, title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'processing', total_words INTEGER NOT NULL DEFAULT 0,
    parsed_pages INTEGER NOT NULL DEFAULT 0, total_pages INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL, FOREIGN KEY(user_id) REFERENCES users(id)
  );
  CREATE INDEX IF NOT EXISTS books_user_id ON books(user_id);
`);

export const publicUser = (user) => user && ({
  id: user.id, email: user.email, provider: user.provider,
  isPaid: Boolean(user.is_paid), tier: user.is_paid ? 'paid' : 'free'
});

export function findOrCreateOAuthUser({ email, provider, providerId }) {
  let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
  if (!user) {
    const id = crypto.randomUUID();
    db.prepare('INSERT INTO users (id,email,provider,provider_id,created_at) VALUES (?,?,?,?,?)')
      .run(id, email.toLowerCase(), provider, providerId, Date.now());
    user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  }
  return user;
}
