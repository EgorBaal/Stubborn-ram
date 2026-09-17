export const shorthands = undefined;

export async function up(pgm) {
  pgm.addConstraint("media", "media_status_check", {
    check: "status IN ('UPLOADING', 'READY', 'PROCESSING', 'FAILED')",
  });
}

export async function down(pgm) {
  pgm.dropConstraint("media", "media_status_check");
}
