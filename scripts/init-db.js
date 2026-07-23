const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const env = process.env;
const pool = new Pool({
  host: env.DB_HOST || 'localhost',
  port: Number(env.DB_PORT || 5432),
  database: env.DB_NAME || 'Smart',
  user: env.DB_USER || 'postgres',
  password: env.DB_PASSWORD || 'admin123',
  max: 1,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

const sqlFile = path.resolve(__dirname, '..', 'db', 'setup.sql');
const sql = fs.readFileSync(sqlFile, 'utf8');

async function main() {
  const client = await pool.connect();
  try {
    console.log('Starting Smart Retail Pro database setup...');
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log('Database setup completed successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Database setup failed:', error.message || error);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main();
