exports.up = (pgm) => {
  pgm.addColumn(
    "workout_exercises",
    {
      tracked_parameters: {
        type: "jsonb",
        notNull: false,
        default: '["weight", "repetitions", "difficulty"]::jsonb',
      },
    },
    {
      ifNotExists: true,
    },
  );

  pgm.sql(`
    UPDATE workout_exercises
    SET tracked_parameters = '["weight", "repetitions", "difficulty"]'::jsonb
    WHERE tracked_parameters IS NULL;
  `);
};

exports.down = (pgm) => {
  pgm.dropColumn("workout_exercises", "tracked_parameters", {
    ifExists: true,
  });
};
