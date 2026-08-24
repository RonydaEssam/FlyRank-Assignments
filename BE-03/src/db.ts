import Database from "better-sqlite3";

const db: Database.Database = new Database('tasks.db');

db.exec(`
    CREATE TABLE IF NOT EXISTS tasks(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0
)
`);

const row = db.prepare('SELECT COUNT(*) as count FROM tasks').get() as { count: number };

if (row.count === 0) {
    const seed = db.prepare('INSERT INTO tasks (title, done) VALUES (?, ?)');
    seed.run('Prepare working environment', 1);
    seed.run('Create first endpoint', 1);
    seed.run('Update endpoint', 0);
}

export { db };