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

  console.log('--- Внешние ключи, ссылающиеся на Templates ---');
  const fk = await c.query(`
    SELECT
      conrelid::regclass::text AS source_table,
      conname AS constraint_name,
      confrelid::regclass::text AS referenced_table
    FROM pg_constraint
    WHERE contype = 'f'
      AND confrelid IN (
        'public.training_templates'::regclass,
        'public.training_template_exercises'::regclass,
        'public.training_template_sets'::regclass
      )
    ORDER BY source_table, constraint_name
  `);
  console.table(fk.rows);

  console.log('--- Представления, в определениях которых упоминаются Templates ---');
  const views = await c.query(`
    SELECT schemaname, viewname
    FROM pg_views
    WHERE definition ILIKE '%training_templates%'
       OR definition ILIKE '%training_template_exercises%'
       OR definition ILIKE '%training_template_sets%'
    ORDER BY schemaname, viewname
  `);
  console.table(views.rows);

  console.log('--- Триггеры на таблицах Templates ---');
  const triggers = await c.query(`
    SELECT event_object_table AS table_name, trigger_name
    FROM information_schema.triggers
    WHERE trigger_schema = 'public'
      AND event_object_table IN (
        'training_templates',
        'training_template_exercises',
        'training_template_sets'
      )
    ORDER BY event_object_table, trigger_name
  `);
  console.table(triggers.rows);
} catch (e) {
  console.error('Ошибка:', e.message);
  process.exitCode = 1;
} finally {
  await c.end().catch(() => {});
}
