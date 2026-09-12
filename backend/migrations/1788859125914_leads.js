export const shorthands = undefined;

export const up = (pgm) => {
  pgm.createTable("leads", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },

    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("now()"),
    },

    status: {
      type: "varchar(32)",
      notNull: true,
      default: "new",
    },

    full_name: {
      type: "varchar(200)",
      notNull: true,
    },

    age: {
      type: "integer",
      notNull: true,
    },

    height: {
      type: "integer",
      notNull: true,
    },

    weight: {
      type: "numeric(5,2)",
      notNull: true,
    },

    goals: {
      type: "jsonb",
      notNull: true,
      default: pgm.func("'[]'::jsonb"),
    },

    goal_details: {
      type: "text",
      notNull: true,
      default: "",
    },

    training_experience: {
      type: "text",
      notNull: true,
      default: "",
    },

    training_experience_details: {
      type: "text",
      notNull: true,
      default: "",
    },

    difficulties: {
      type: "jsonb",
      notNull: true,
      default: pgm.func("'[]'::jsonb"),
    },

    difficulties_details: {
      type: "text",
      notNull: true,
      default: "",
    },

    ideal_results: {
      type: "jsonb",
      notNull: true,
      default: pgm.func("'[]'::jsonb"),
    },

    ideal_result_details: {
      type: "text",
      notNull: true,
      default: "",
    },

    report_preferences: {
      type: "jsonb",
      notNull: true,
      default: pgm.func("'[]'::jsonb"),
    },

    report_preferences_details: {
      type: "text",
      notNull: true,
      default: "",
    },

    telegram: {
      type: "varchar(200)",
      notNull: true,
      default: "",
    },

    vk: {
      type: "varchar(500)",
      notNull: true,
      default: "",
    },

    instagram: {
      type: "varchar(500)",
      notNull: true,
      default: "",
    },

    phone: {
      type: "varchar(100)",
      notNull: true,
      default: "",
    },
  });

  pgm.createIndex("leads", "created_at");
  pgm.createIndex("leads", "status");
};

export const down = (pgm) => {
  pgm.dropTable("leads");
};
