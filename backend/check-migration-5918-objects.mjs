import 'dotenv/config';
import pg from 'pg';

const client = new pg.Client({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

try {
  await client.connect();

  const result = await client.query(`
    SELECT
      schemaname AS schema,
      tablename AS table
    FROM pg_catalog.pg_tables
    WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
      AND (
        tablename ILIKE '%template%'
        OR tablename ILIKE '%training%'
        OR tablename ILIKE '%workout%'
      )
    ORDER BY schemaname, tablename
  `);

  console.table(result.rows);
} catch (error) {
  console.error('Ошибка:', error.message);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
