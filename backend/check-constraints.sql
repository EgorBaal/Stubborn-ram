SELECT
  tc.constraint_name,
  tc.constraint_type,
  pg_get_constraintdef(c.oid) AS definition
FROM information_schema.table_constraints tc
JOIN pg_constraint c
  ON c.conname = tc.constraint_name
WHERE tc.table_name = 'training_set_notes'
ORDER BY tc.constraint_type, tc.constraint_name;
