export const shorthands = undefined;

export const up = (pgm) => {
  pgm.createIndex("auth_tokens", ["user_id", "type"], {
    name: "auth_tokens_one_active_per_user_type",
    unique: true,
    where: "used_at IS NULL",
  });
};

export const down = (pgm) => {
  pgm.dropIndex("auth_tokens", ["user_id", "type"], {
    name: "auth_tokens_one_active_per_user_type",
  });
};
