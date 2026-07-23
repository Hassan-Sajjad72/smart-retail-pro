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

const sqlFile = path.resolve(__dirname, '..', 'db', 'demo.sql');
const sql = fs.readFileSync(sqlFile, 'utf8');
const statements = sql
  .split(/;\s*(?=\n|$)/g)
  .map((stmt) => stmt.trim())
  .filter((stmt) => stmt && !stmt.startsWith('--'));

async function run() {
  const client = await pool.connect();
  try {
    for (const statement of statements) {
      console.log('\n---');
      console.log(statement);
      try {
        const result = await client.query(statement);
        if (result.command === 'SELECT' || result.command === 'INSERT' || result.command === 'UPDATE' || result.command === 'DELETE') {
          console.log(JSON.stringify(result.rows.slice(0, 20), null, 2));
          if (result.rows.length > 20) {
            console.log(`... ${result.rows.length - 20} more rows`);
          }
        } else {
          console.log(`${result.command} completed. (${result.rowCount ?? 0} rows)`);
        }
      } catch (err) {
        console.error('Statement failed:', err.message || err);
      }
    }
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((error) => {
  console.error('Demo runner failed:', error.message || error);
  process.exit(1);
});
