export const shorthands = undefined;

export const up = (pgm) => {
  pgm.createTable("training_templates", {
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
      notNull: true,
    },

    training_type: {
      type: "text",
    },

    comment: {
      type: "text",
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

  pgm.createIndex("training_templates", ["user_id", "created_at"]);

  pgm.createTable("training_template_exercises", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },

    template_id: {
      type: "uuid",
      notNull: true,
      references: "training_templates",
      onDelete: "CASCADE",
    },

    exercise_id: {
      type: "uuid",
      notNull: true,
      references: "exercises",
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
  });

  pgm.createIndex("training_template_exercises", ["template_id", "position"]);

  pgm.createTable("training_template_sets", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },

    template_exercise_id: {
      type: "uuid",
      notNull: true,
      references: "training_template_exercises",
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
      type: "numeric",
    },

    difficulty: {
      type: "numeric",
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
      type: "numeric",
    },

    intensity_methods: {
      type: "jsonb",
      notNull: true,
      default: pgm.func("'[]'::jsonb"),
    },
  });

  pgm.createIndex("training_template_sets", [
    "template_exercise_id",
    "position",
  ]);
};

export const down = (pgm) => {
  pgm.dropTable("training_template_sets");
  pgm.dropTable("training_template_exercises");
  pgm.dropTable("training_templates");
};
