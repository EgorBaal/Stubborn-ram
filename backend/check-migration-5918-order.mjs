import 'dotenv/config';
import pg from 'pg';

const c = new pg.Client({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

try {
  await c.connect();

  const result = await c.query(`
    SELECT id, name, run_on
    FROM public.pgmigrations
    WHERE name LIKE '178885912591%'
       OR name LIKE '178885912592%'
    ORDER BY run_on, id
  `);

  console.table(result.rows);
} catch (e) {
  console.error('Ошибка:', e.message);
  process.exitCode = 1;
} finally {
  await c.end().catch(() => {});
}
