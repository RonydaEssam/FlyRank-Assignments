import { configDotenv } from 'dotenv';
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function init() {
    await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      done BOOLEAN NOT NULL DEFAULT false
    )
  `);

    const { rows } = await pool.query('SELECT COUNT(*) FROM tasks');
    const count = Number(rows[0].count);

    if (count === 0) {
        await pool.query(
            'INSERT INTO tasks (title, done) VALUES ($1, $2), ($3, $4), ($5, $6)',
            ['Prepare working environment', true, 'Create first endpoint', true, 'Update endpoint', false]
        );
    }
}

init().catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
});

export { pool };