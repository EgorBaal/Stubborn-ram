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

  const location = await client.query(`
    SELECT current_database() AS db,
           inet_server_addr() AS server,
           inet_server_port() AS port
  `);
  console.log('Подключение:', location.rows);

  const table = await client.query(`
    SELECT to_regclass('public.pgmigrations') AS journal
  `);
  console.log('Таблица журнала:', table.rows);

  if (table.rows[0].journal) {
    const result = await client.query(`
      SELECT *
      FROM public.pgmigrations
      WHERE name::text LIKE $1 OR name::text LIKE $2
      ORDER BY name
    `, ['%1788859125918%', '%5918%']);

    console.log('Записи 5918:', result.rows);
  }
} catch (error) {
  console.error('Ошибка:', error.message);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
