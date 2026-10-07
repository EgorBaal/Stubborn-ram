exports.up = (pgm) => {
  pgm.renameColumn("exercises", "muscle_group", "category");

  pgm.sql(`
    ALTER TABLE exercises
    ALTER COLUMN primary_muscles TYPE text[]
    USING (
      CASE
        WHEN primary_muscles IS NULL THEN NULL
        ELSE ARRAY[primary_muscles]
      END
    )
  `);

  pgm.sql(`
    ALTER TABLE exercises
    ALTER COLUMN secondary_muscles TYPE text[]
    USING (
      CASE
        WHEN secondary_muscles IS NULL THEN NULL
        ELSE ARRAY[secondary_muscles]
      END
    )
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    ALTER TABLE exercises
    ALTER COLUMN secondary_muscles TYPE text
    USING (
      CASE
        WHEN secondary_muscles IS NULL THEN NULL
        ELSE array_to_string(secondary_muscles, ', ')
      END
    )
  `);

  pgm.sql(`
    ALTER TABLE exercises
    ALTER COLUMN primary_muscles TYPE text
    USING (
      CASE
        WHEN primary_muscles IS NULL THEN NULL
        ELSE array_to_string(primary_muscles, ', ')
      END
    )
  `);

  pgm.renameColumn("exercises", "category", "muscle_group");
};
