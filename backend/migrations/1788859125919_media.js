import { MigrationBuilder } from "node-pg-migrate";

export const shorthands = undefined;

export async function up(pgm) {
  pgm.createTable("media", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },
    owner_id: {
      type: "uuid",
      notNull: true,
      references: "users(id)",
    },
    author_id: {
      type: "uuid",
      references: "users(id)",
    },
    object_key: {
      type: "text",
      notNull: true,
      unique: true,
    },
    original_name: {
      type: "text",
    },
    mime_type: {
      type: "text",
      notNull: true,
    },
    size_bytes: {
      type: "bigint",
      notNull: true,
    },
    status: {
      type: "text",
      notNull: true,
      default: "READY",
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

  pgm.createTable("media_links", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },
    media_id: {
      type: "uuid",
      notNull: true,
      references: "media(id)",
      onDelete: "RESTRICT",
    },
    entity_type: {
      type: "text",
      notNull: true,
    },
    entity_id: {
      type: "uuid",
      notNull: true,
    },
    role: {
      type: "text",
    },
    sort_order: {
      type: "integer",
    },
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("now()"),
    },
  });

  pgm.createIndex("media_links", ["entity_type", "entity_id"]);
  pgm.createIndex("media_links", ["media_id"]);
}

export async function down(pgm) {
  pgm.dropTable("media_links");
  pgm.dropTable("media");
}
