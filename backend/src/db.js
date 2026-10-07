const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env'), quiet: true });
const { Pool } = require('pg');

let connection;
if (process.env.DATABASE_URL?.trim()) {
  connection = { connectionString: process.env.DATABASE_URL };
} else {
  const required = ['PGHOST', 'PGPORT', 'PGDATABASE', 'PGUSER', 'PGPASSWORD'];
  const missing = required.filter(name => !process.env[name]?.trim());
  if (missing.length) {
    throw new Error(`Missing database environment variables: ${missing.join(', ')}. Set DATABASE_URL or all required PG variables in backend/.env or the process environment.`);
  }

  const port = Number(process.env.PGPORT);
  if (!/^\d+$/.test(process.env.PGPORT) || !Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PGPORT must be an integer between 1 and 65535.');
  }

  connection = {
    host: process.env.PGHOST,
    port,
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
  };
}

const pool = new Pool({
  ...connection,
  connectionTimeoutMillis: 5000,
});

pool.on('error', error => {
  console.error('Unexpected Postgres pool error:', error.message);
});

module.exports = pool;
