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
    SELECT
      count(*)::int AS total_rows,
      count(*) FILTER (
        WHERE tracked_parameters IS NULL
      )::int AS null_rows,
      count(*) FILTER (
        WHERE tracked_parameters =
          '["weight", "repetitions", "difficulty"]'::jsonb
      )::int AS default_value_rows
    FROM public.workout_exercises
  `);

  console.log('Результат:', result.rows);
} catch (e) {
  console.error('Ошибка:', e.message);
  process.exitCode = 1;
} finally {
  await c.end().catch(() => {});
}
