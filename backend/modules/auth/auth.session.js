import {
  createSessionToken,
  getSessionExpiration,
  hashSessionToken,
} from "./auth.service.js";

const SESSION_COOKIE = "stubbornram_session";

export function setSessionCookie(reply, token) {
  reply.setCookie(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });
}

export function clearSessionCookie(reply) {
  reply.clearCookie(SESSION_COOKIE, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  });
}

export function getSessionToken(request) {
  return request.cookies[SESSION_COOKIE] ?? null;
}

export async function createUserSession(pool, userId, reply) {
  const token = createSessionToken();
  const tokenHash = hashSessionToken(token);
  const expiresAt = getSessionExpiration();

  await pool.query(
    `
      INSERT INTO sessions (
        user_id,
        token_hash,
        expires_at
      )
      VALUES ($1, $2, $3)
    `,
    [userId, tokenHash, expiresAt],
  );

  setSessionCookie(reply, token);
}

export async function deleteUserSession(pool, request, reply) {
  const token = getSessionToken(request);

  if (token) {
    const tokenHash = hashSessionToken(token);

    await pool.query(
      `
        DELETE FROM sessions
        WHERE token_hash = $1
      `,
      [tokenHash],
    );
  }

  clearSessionCookie(reply);
}
