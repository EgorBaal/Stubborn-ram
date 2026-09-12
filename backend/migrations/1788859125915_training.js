export const shorthands = undefined;

export const up = (pgm) => {
  pgm.createTable("exercises", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },
    name: {
      type: "text",
      notNull: true,
    },
    muscle_group: {
      type: "text",
    },
    user_id: {
      type: "uuid",
      references: "users",
      onDelete: "CASCADE",
    },
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    updated_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  pgm.createIndex("exercises", ["user_id", "name"]);

  pgm.createTable("workouts", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },
    user_id: {
      type: "uuid",
      notNull: true,
      references: "users",
      onDelete: "CASCADE",
    },
    title: {
      type: "text",
    },
    training_date: {
      type: "date",
      notNull: true,
    },
    start_time: {
      type: "timestamptz",
    },
    end_time: {
      type: "timestamptz",
    },
    training_type: {
      type: "text",
    },
    comment: {
      type: "text",
    },
    status: {
      type: "text",
      notNull: true,
      default: "completed",
    },
    completed_at: {
      type: "timestamptz",
    },
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    updated_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  pgm.createIndex("workouts", ["user_id", "training_date"]);
  pgm.createIndex("workouts", ["user_id", "created_at"]);

  pgm.createTable("workout_exercises", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },
    workout_id: {
      type: "uuid",
      notNull: true,
      references: "workouts",
      onDelete: "CASCADE",
    },
    exercise_id: {
      type: "uuid",
      notNull: true,
      references: "exercises",
      onDelete: "RESTRICT",
    },
    position: {
      type: "integer",
      notNull: true,
    },
    exercise_comment: {
      type: "text",
    },
    superset_after: {
      type: "boolean",
      notNull: true,
      default: false,
    },
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    updated_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  pgm.createIndex("workout_exercises", ["workout_id", "position"]);
  pgm.createIndex("workout_exercises", ["exercise_id"]);

  pgm.createTable("workout_sets", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },
    workout_exercise_id: {
      type: "uuid",
      notNull: true,
      references: "workout_exercises",
      onDelete: "CASCADE",
    },
    position: {
      type: "integer",
      notNull: true,
    },
    weight: {
      type: "numeric",
    },
    repetitions: {
      type: "integer",
    },
    difficulty: {
      type: "text",
    },
    distance: {
      type: "numeric",
    },
    calories: {
      type: "numeric",
    },
    speed: {
      type: "numeric",
    },
    power: {
      type: "numeric",
    },
    incline: {
      type: "numeric",
    },
    time: {
      type: "numeric",
    },
    rir: {
      type: "numeric",
    },
    rpe: {
      type: "numeric",
    },
    rest: {
      type: "integer",
    },
    intensity_methods: {
      type: "jsonb",
    },
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    updated_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  pgm.createIndex("workout_sets", ["workout_exercise_id", "position"]);
};

export const down = (pgm) => {
  pgm.dropTable("workout_sets");
  pgm.dropTable("workout_exercises");
  pgm.dropTable("workouts");
  pgm.dropTable("exercises");
};
