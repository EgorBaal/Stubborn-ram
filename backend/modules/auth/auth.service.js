
import crypto from "node:crypto";
import argon2 from "argon2";

const SESSION_DAYS = 30;

export function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

export async function hashPassword(password) {
  return await argon2.hash(password);
}

export async function verifyPassword(password, passwordHash) {
  return await argon2.verify(passwordHash, password);
}

export function createSessionToken() {
  return crypto.randomBytes(32).toString("base64url");
}

export function hashSessionToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function getSessionExpiration() {
  const expiresAt = new Date();

  expiresAt.setDate(expiresAt.getDate() + SESSION_DAYS);

  return expiresAt;
}
