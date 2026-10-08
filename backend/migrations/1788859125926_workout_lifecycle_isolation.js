exports.up = (pgm) => {
  pgm.sql(`
    ALTER TABLE workouts
      ALTER COLUMN status DROP NOT NULL,
      ALTER COLUMN status SET DEFAULT NULL;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    UPDATE workouts
    SET status = 'completed'
    WHERE status IS NULL;

    ALTER TABLE workouts
      ALTER COLUMN status SET NOT NULL,
      ALTER COLUMN status SET DEFAULT 'completed';
  `);
};
