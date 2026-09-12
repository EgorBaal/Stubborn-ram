export const shorthands = undefined;

export const up = (pgm) => {
  pgm.createTable('auth_tokens', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    user_id: {
      type: 'uuid',
      notNull: true,
      references: 'users(id)',
      onDelete: 'CASCADE',
    },
    type: {
      type: 'varchar(32)',
      notNull: true,
    },
    token_hash: {
      type: 'text',
      notNull: true,
      unique: true,
    },
    expires_at: {
      type: 'timestamptz',
      notNull: true,
    },
    used_at: {
      type: 'timestamptz',
    },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
  });

  pgm.createIndex('auth_tokens', ['user_id', 'type']);
  pgm.createIndex('auth_tokens', 'expires_at');
};

export const down = (pgm) => {
  pgm.dropTable('auth_tokens');
};
