exports.up = (pgm) => {
  pgm.sql(`
    ALTER TABLE workouts
      ALTER COLUMN start_time TYPE time
      USING start_time::time,
      ALTER COLUMN end_time TYPE time
      USING end_time::time;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    ALTER TABLE workouts
      ALTER COLUMN start_time TYPE timestamptz
      USING start_time::timestamp AT TIME ZONE 'UTC',
      ALTER COLUMN end_time TYPE timestamptz
      USING end_time::timestamp AT TIME ZONE 'UTC';
  `);
};
