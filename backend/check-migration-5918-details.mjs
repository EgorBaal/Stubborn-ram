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

  console.log('\n--- Количество строк в таблицах Templates ---');
  const counts = await client.query(`
    SELECT 'training_templates' AS table_name, count(*)::bigint AS row_count
    FROM public.training_templates
    UNION ALL
    SELECT 'training_template_exercises', count(*)::bigint
    FROM public.training_template_exercises
    UNION ALL
    SELECT 'training_template_sets', count(*)::bigint
    FROM public.training_template_sets
    ORDER BY table_name
  `);
  console.table(counts.rows);

  console.log('\n--- Внешние ключи, связанные с таблицами Templates ---');
  const fks = await client.query(`
    SELECT
      conrelid::regclass::text AS source_table,
      conname AS constraint_name,
      confrelid::regclass::text AS referenced_table
    FROM pg_constraint
    WHERE contype = 'f'
      AND (
        conrelid IN (
          'public.training_templates'::regclass,
          'public.training_template_exercises'::regclass,
          'public.training_template_sets'::regclass
        )
        OR confrelid IN (
          'public.training_templates'::regclass,
          'public.training_template_exercises'::regclass,
          'public.training_template_sets'::regclass
        )
      )
    ORDER BY source_table, constraint_name
  `);
  console.table(fks.rows);
} catch (error) {
  console.error('Ошибка:', error.message);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
