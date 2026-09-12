import crypto from "node:crypto";

const EMAIL_VERIFICATION_HOURS = 24;
const PASSWORD_RESET_HOURS = 1;

export function createAuthToken() {
  return crypto.randomBytes(32).toString("base64url");
}

export function hashAuthToken(token) {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

export function getEmailVerificationExpiration() {
  const expiresAt = new Date();

  expiresAt.setHours(
    expiresAt.getHours() + EMAIL_VERIFICATION_HOURS,
  );

  return expiresAt;
}

export function getPasswordResetExpiration() {
  const expiresAt = new Date();

  expiresAt.setHours(
    expiresAt.getHours() + PASSWORD_RESET_HOURS,
  );

  return expiresAt;
}
