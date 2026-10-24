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
    SELECT id, tracked_parameters
    FROM public.workout_exercises
    WHERE tracked_parameters IS DISTINCT FROM
      '["weight", "repetitions", "difficulty"]'::jsonb
    ORDER BY id
  `);

  console.log('Нестандартные значения:', result.rows);
} catch (e) {
  console.error('Ошибка:', e.message);
  process.exitCode = 1;
} finally {
  await c.end().catch(() => {});
}
