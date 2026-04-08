import postgres from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL!;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}

export const sql = postgres(DATABASE_URL, {
  ssl: 'require',
  max: 1, // High connection counts can be an issue in serverless
  idle_timeout: 20,
  connect_timeout: 30,
});

export default sql;
