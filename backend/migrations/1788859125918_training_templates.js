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
};

export const down = (pgm) => {
  pgm.dropTable("training_templates");
};
