import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.ts'; // important extension!

declare global {
  var _postgresPool: Pool | undefined;
}

export const isDbConfigured = (): boolean => {
  return Boolean(process.env.SQL_HOST || process.env.PGHOST || process.env.DATABASE_URL);
};

export const createPool = () => {
  if (!global._postgresPool) {
    global._postgresPool = new Pool({
      host: process.env.SQL_HOST || process.env.PGHOST || '127.0.0.1',
      user: process.env.SQL_USER || process.env.PGUSER || 'postgres',
      password: process.env.SQL_PASSWORD || process.env.PGPASSWORD || '',
      database: process.env.SQL_DB_NAME || process.env.PGDATABASE || 'ds_engineering',
      max: 10,
      connectionTimeoutMillis: 3000,
    });

    global._postgresPool.on('error', (err) => {
      if (isDbConfigured()) {
        console.warn('PostgreSQL pool connection notice:', err.message);
      }
    });
  }
  return global._postgresPool;
};

const pool = createPool();

export const db = drizzle(pool, { schema });

