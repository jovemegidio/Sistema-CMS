import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import fs from 'fs';
import path from 'path';

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../database.db');

// ─── Compatibility wrapper: provides the same API as better-sqlite3 ───

function persistDatabase(): void {
  if (!sqlJsDb) return;
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DB_PATH, Buffer.from(sqlJsDb.export()));
}

class StatementWrapper {
  constructor(private db: SqlJsDatabase, private sql: string) {}

  get(...params: any[]): any {
    const stmt = this.db.prepare(this.sql);
    try {
      if (params.length) stmt.bind(params);
      return stmt.step() ? stmt.getAsObject() : undefined;
    } finally {
      stmt.free();
    }
  }

  all(...params: any[]): any[] {
    const stmt = this.db.prepare(this.sql);
    try {
      if (params.length) stmt.bind(params);
      const rows: any[] = [];
      while (stmt.step()) rows.push(stmt.getAsObject());
      return rows;
    } finally {
      stmt.free();
    }
  }

  run(...params: any[]): { changes: number; lastInsertRowid: number } {
    this.db.run(this.sql, params.length ? params : undefined);
    persistDatabase();
    const changes = this.db.getRowsModified();
    const result = this.db.exec('SELECT last_insert_rowid() as id');
    const lastInsertRowid = result.length > 0 ? (result[0].values[0][0] as number) : 0;
    return { changes, lastInsertRowid };
  }
}

class DatabaseWrapper {
  constructor(private db: SqlJsDatabase) {}

  prepare(sql: string): StatementWrapper {
    return new StatementWrapper(this.db, sql);
  }

  exec(sql: string): void {
    this.db.exec(sql);
    persistDatabase();
  }
}

// ─── Singleton ───

let sqlJsDb: SqlJsDatabase | null = null;
let wrapper: DatabaseWrapper | null = null;

export function getDatabase(): DatabaseWrapper {
  if (!wrapper) throw new Error('Database not initialised – call initializeDatabase() first.');
  return wrapper;
}

export async function initializeDatabase(): Promise<void> {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    sqlJsDb = new SQL.Database(buffer);
  } else {
    sqlJsDb = new SQL.Database();
  }

  wrapper = new DatabaseWrapper(sqlJsDb);

  // Enable foreign keys
  wrapper.exec('PRAGMA foreign_keys = ON;');

  // Create tables
  wrapper.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'author' CHECK(role IN ('admin', 'editor', 'author')),
      avatar TEXT,
      bio TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  wrapper.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      color TEXT DEFAULT '#6366f1',
      post_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  wrapper.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      content TEXT,
      excerpt TEXT,
      cover_image TEXT,
      status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'published', 'archived')),
      author_id TEXT NOT NULL,
      category_id TEXT,
      views INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      published_at TEXT,
      FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    );
  `);

  wrapper.exec(`
    CREATE TABLE IF NOT EXISTS media (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size INTEGER NOT NULL,
      url TEXT NOT NULL,
      uploaded_by TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  wrapper.exec('CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);');
  wrapper.exec('CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);');
  wrapper.exec('CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category_id);');
  wrapper.exec('CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at);');
  wrapper.exec('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);');
  wrapper.exec('CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);');

  console.log('✅ Database initialized successfully');
}
