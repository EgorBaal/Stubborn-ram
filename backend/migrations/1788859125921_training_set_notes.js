import { MigrationBuilder } from "node-pg-migrate";

export const shorthands = undefined;

export async function up(pgm) {
  pgm.createTable("training_set_notes", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },

    workout_set_id: {
      type: "uuid",
      notNull: true,
      references: "workout_sets(id)",
      onDelete: "CASCADE",
    },

    author_id: {
      type: "uuid",
      notNull: true,
      references: "users(id)",
    },

    type: {
      type: "text",
      notNull: true,
    },

    comment: {
      type: "text",
    },

    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("now()"),
    },

    updated_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("now()"),
    },
  });

  pgm.addConstraint("training_set_notes", "training_set_notes_type_check", {
    check: "type IN ('CLIENT_NOTE', 'TRAINER_FEEDBACK')",
  });

  pgm.addConstraint(
    "training_set_notes",
    "training_set_notes_workout_set_type_unique",
    {
      unique: ["workout_set_id", "type"],
    },
  );

  pgm.createIndex("training_set_notes", ["workout_set_id"]);
  pgm.createIndex("training_set_notes", ["author_id"]);
}

export async function down(pgm) {
  pgm.dropTable("training_set_notes");
}
