import postgres from 'postgres';
import { db as drizzleDb } from './db/index';

const DATABASE_URL = process.env.DATABASE_URL!;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}

// Named export for Drizzle (used by existing admin actions)
export const db = drizzleDb;

// Named export for raw postgres.js (used by newsletter)
export const sql = postgres(DATABASE_URL, {
  ssl: 'require',
  max: 1, // High connection counts can be an issue in serverless
  idle_timeout: 20,
  connect_timeout: 30,
});

export default sql;
