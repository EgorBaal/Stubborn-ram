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

  const location = await c.query(`
    SELECT current_database() AS db,
           inet_server_addr() AS server,
           inet_server_port() AS port
  `);
  console.log('Подключение:', location.rows);

  const column = await c.query(`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'workout_exercises'
      AND column_name = 'tracked_parameters'
  `);
  console.log('Столбец tracked_parameters:', column.rows);
} catch (e) {
  console.error('Ошибка:', e.message);
  process.exitCode = 1;
} finally {
  await c.end().catch(() => {});
}
