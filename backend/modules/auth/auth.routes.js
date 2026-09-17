import {
  authCredentialsSchema,
  resetPasswordRequestSchema,
  updatePasswordSchema,
} from "./auth.schemas.js";

import {
  normalizeEmail,
  hashPassword,
  verifyPassword,
} from "./auth.service.js";

import {
  createUserSession,
  deleteUserSession,
  getSessionToken,
} from "./auth.session.js";

import {
  createAuthToken,
  hashAuthToken,
  getEmailVerificationExpiration,
  getPasswordResetExpiration,
} from "./auth.tokens.js";

import { sendEmail } from "../email/email.service.js";

function getFrontendUrl(path) {
  const baseUrl =
    process.env.NODE_ENV === "development"
      ? "http://localhost:5173"
      : "https://stubbornram.ru";

  return `${baseUrl}${path}`;
}

async function createEmailVerificationToken(pool, userId) {
  await pool.query(
    `
      UPDATE auth_tokens
      SET used_at = now()
      WHERE user_id = $1
        AND type = 'email_verification'
        AND used_at IS NULL
    `,
    [userId],
  );

  const token = createAuthToken();
  const tokenHash = hashAuthToken(token);
  const expiresAt = getEmailVerificationExpiration();

  await pool.query(
    `
      INSERT INTO auth_tokens (
        user_id,
        type,
        token_hash,
        expires_at
      )
      VALUES ($1, 'email_verification', $2, $3)
    `,
    [userId, tokenHash, expiresAt],
  );

  return token;
}

async function createPasswordResetToken(pool, userId) {
  await pool.query(
    `
      UPDATE auth_tokens
      SET used_at = now()
      WHERE user_id = $1
        AND type = 'password_reset'
        AND used_at IS NULL
    `,
    [userId],
  );

  const token = createAuthToken();
  const tokenHash = hashAuthToken(token);
  const expiresAt = getPasswordResetExpiration();

  await pool.query(
    `
      INSERT INTO auth_tokens (
        user_id,
        type,
        token_hash,
        expires_at
      )
      VALUES ($1, 'password_reset', $2, $3)
    `,
    [userId, tokenHash, expiresAt],
  );

  return token;
}

async function sendVerificationEmail(email, token) {
  const verificationUrl = getFrontendUrl(
    `/auth/confirm?token=${encodeURIComponent(token)}`,
  );

  await sendEmail({
    email,
    subject: "Подтвердите email — Stubborn Ram",
    html: `
      <div style="background:#0d0d0d;padding:30px;font-family:Arial,sans-serif;color:#ffffff;">
        <div style="max-width:600px;margin:0 auto;background:#161616;border:1px solid #2b2b2b;border-radius:18px;padding:28px;text-align:center;">
          <img
            src="https://stubbornram.ru/ram-logo-email.png?v=1"
            alt="Stubborn Ram"
            style="width:110px;max-width:100%;height:auto;margin-bottom:20px;"
          />

          <h1 style="margin:0 0 16px;color:#ffffff;">
            Добро пожаловать в Stubborn Ram
          </h1>

          <p style="color:#cccccc;line-height:1.6;">
            Подтверди свой email, чтобы завершить регистрацию.
          </p>

          <a
            href="${verificationUrl}"
            style="display:inline-block;margin-top:20px;padding:14px 24px;background:#ff6200;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:bold;"
          >
            Подтвердить email
          </a>

          <p style="margin-top:24px;color:#777777;font-size:13px;">
            Ссылка действительна 24 часа.
          </p>
        </div>
      </div>
    `,
    text: `Подтвердите email в Stubborn Ram: ${verificationUrl}`,
  });
}

async function sendPasswordResetEmail(email, token) {
  const resetUrl = getFrontendUrl(
    `/reset-password?token=${encodeURIComponent(token)}`,
  );

  await sendEmail({
    email,
    subject: "Восстановление пароля — Stubborn Ram",
    html: `
      <div style="background:#0d0d0d;padding:30px;font-family:Arial,sans-serif;color:#ffffff;">
        <div style="max-width:600px;margin:0 auto;background:#161616;border:1px solid #2b2b2b;border-radius:18px;padding:28px;text-align:center;">
          <img
            src="https://stubbornram.ru/ram-logo-email.png?v=1"
            alt="Stubborn Ram"
            style="width:110px;max-width:100%;height:auto;margin-bottom:20px;"
          />

          <h1
  style="margin:0 0 16px;color:#ffffff;font-size:20px;line-height:1.3;word-break:normal;overflow-wrap:normal;"
>
  <span style="white-space:nowrap;">Восстановление</span>
  <span style="white-space:nowrap;"> пароля</span>
</h1>

          <p style="color:#cccccc;line-height:1.6;">
            Нажми кнопку ниже, чтобы задать новый пароль.
          </p>

          <a
            href="${resetUrl}"
            style="display:inline-block;margin-top:20px;padding:14px 24px;background:#ff6200;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:bold;"
          >
            Изменить пароль
          </a>

          <p style="margin-top:24px;color:#777777;font-size:13px;">
            Ссылка действительна 1 час.
          </p>
        </div>
      </div>
    `,
    text: `Восстановление пароля в Stubborn Ram: ${resetUrl}`,
  });
}

export default async function authRoutes(app) {
  app.post(
    "/api/auth/register",
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: "15 minutes",
        },
      },
    },
    async (request, reply) => {
      const parsed = authCredentialsSchema.safeParse(request.body);

      if (!parsed.success) {
        return reply.code(400).send({
          error: "INVALID_INPUT",
          message: "Некорректный email или пароль.",
        });
      }

      const email = normalizeEmail(parsed.data.email);

      const existingUser = await app.pg.query(
        "SELECT id FROM users WHERE email = $1 LIMIT 1",
        [email],
      );

      if (existingUser.rowCount > 0) {
        return reply.code(409).send({
          error: "EMAIL_ALREADY_EXISTS",
          message: "Пользователь с таким email уже существует.",
        });
      }

      const passwordHash = await hashPassword(parsed.data.password);
      const client = await app.pg.connect();

      let user;

      try {
        await client.query("BEGIN");

        const userResult = await client.query(
          `
            INSERT INTO users (
              email,
              password_hash
            )
            VALUES ($1, $2)
            RETURNING id, email, email_verified_at, created_at
          `,
          [email, passwordHash],
        );

        user = userResult.rows[0];

        await client.query(
          `
            INSERT INTO profiles (
              user_id
            )
            VALUES ($1)
          `,
          [user.id],
        );

        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }

      const token = await createEmailVerificationToken(app.pg, user.id);

      await sendVerificationEmail(user.email, token);

      return reply.code(201).send({
        user,
        authenticated: false,
        emailVerificationRequired: true,
      });
    },
  );

  app.post(
    "/api/auth/login",
    {
      config: {
        rateLimit: {
          max: 10,
          timeWindow: "15 minutes",
        },
      },
    },
    async (request, reply) => {
      const parsed = authCredentialsSchema.safeParse(request.body);

      if (!parsed.success) {
        return reply.code(400).send({
          error: "INVALID_INPUT",
          message: "Некорректный email или пароль.",
        });
      }

      const email = normalizeEmail(parsed.data.email);

      const result = await app.pg.query(
        `
          SELECT
            id,
            email,
            password_hash,
            email_verified_at
          FROM users
          WHERE email = $1
          LIMIT 1
        `,
        [email],
      );

      if (result.rowCount === 0) {
        return reply.code(401).send({
          error: "INVALID_CREDENTIALS",
          message: "Неверный email или пароль.",
        });
      }

      const user = result.rows[0];

      const passwordValid = await verifyPassword(
        parsed.data.password,
        user.password_hash,
      );

      if (!passwordValid) {
        return reply.code(401).send({
          error: "INVALID_CREDENTIALS",
          message: "Неверный email или пароль.",
        });
      }

      if (!user.email_verified_at) {
        return reply.code(403).send({
          error: "EMAIL_NOT_VERIFIED",
          message: "Сначала подтвердите email.",
        });
      }

      await createUserSession(app.pg, user.id, reply);

      return {
        user: {
          id: user.id,
          email: user.email,
          email_verified_at: user.email_verified_at,
        },
        authenticated: true,
      };
    },
  );

  app.get("/api/auth/session", async (request, reply) => {
    const token = getSessionToken(request);

    if (!token) {
      return reply.code(401).send({
        error: "UNAUTHENTICATED",
        message: "Сессия отсутствует.",
      });
    }

    const tokenHash = await import("node:crypto").then(({ default: crypto }) =>
      crypto.createHash("sha256").update(token).digest("hex"),
    );

    const result = await app.pg.query(
      `
        SELECT
          u.id,
          u.email,
          u.email_verified_at,
          p.first_name,
          p.last_name
        FROM sessions s
        JOIN users u ON u.id = s.user_id
        LEFT JOIN profiles p ON p.user_id = u.id
        WHERE s.token_hash = $1
          AND s.expires_at > now()
        LIMIT 1
      `,
      [tokenHash],
    );

    if (result.rowCount === 0) {
      return reply.code(401).send({
        error: "UNAUTHENTICATED",
        message: "Сессия отсутствует или истекла.",
      });
    }

    await app.pg.query(
      `
        UPDATE sessions
        SET last_used_at = now()
        WHERE token_hash = $1
      `,
      [tokenHash],
    );

    return {
      user: result.rows[0],
      authenticated: true,
    };
  });

  app.post("/api/auth/logout", async (request, reply) => {
    await deleteUserSession(app.pg, request, reply);

    return {
      authenticated: false,
    };
  });

  app.post(
    "/api/auth/resend-verification",
    {
      config: {
        rateLimit: {
          max: 3,
          timeWindow: "15 minutes",
        },
      },
    },
    async (request, reply) => {
      const parsed = resetPasswordRequestSchema.safeParse(request.body);

      if (!parsed.success) {
        return reply.code(400).send({
          error: "INVALID_INPUT",
          message: "Некорректный email.",
        });
      }

      const email = normalizeEmail(parsed.data.email);

      const result = await app.pg.query(
        `
          SELECT id, email, email_verified_at
          FROM users
          WHERE email = $1
          LIMIT 1
        `,
        [email],
      );

      if (result.rowCount === 0 || result.rows[0].email_verified_at) {
        return {
          ok: true,
        };
      }

      const user = result.rows[0];
      const token = await createEmailVerificationToken(app.pg, user.id);

      await sendVerificationEmail(user.email, token);

      return {
        ok: true,
      };
    },
  );

  app.post(
    "/api/auth/verify-email",
    {
      config: {
        rateLimit: {
          max: 10,
          timeWindow: "15 minutes",
        },
      },
    },
    async (request, reply) => {
      const token =
        typeof request.body?.token === "string" ? request.body.token : "";

      if (!token) {
        return reply.code(400).send({
          error: "INVALID_TOKEN",
          message: "Некорректная ссылка подтверждения.",
        });
      }

      const tokenHash = hashAuthToken(token);

      const result = await app.pg.query(
        `
          SELECT
            id,
            user_id
          FROM auth_tokens
          WHERE token_hash = $1
            AND type = 'email_verification'
            AND used_at IS NULL
            AND expires_at > now()
          LIMIT 1
        `,
        [tokenHash],
      );

      if (result.rowCount === 0) {
        return reply.code(400).send({
          error: "INVALID_OR_EXPIRED_TOKEN",
          message: "Ссылка недействительна или истекла.",
        });
      }

      const authToken = result.rows[0];

      const client = await app.pg.connect();

      try {
        await client.query("BEGIN");

        await client.query(
          `
      UPDATE users
      SET email_verified_at = now(),
          updated_at = now()
      WHERE id = $1
    `,
          [authToken.user_id],
        );

        await client.query(
          `
      UPDATE auth_tokens
      SET used_at = now()
      WHERE id = $1
    `,
          [authToken.id],
        );

        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }

      return {
        ok: true,
        emailVerified: true,
      };
    },
  );

  app.post(
    "/api/auth/reset-password/request",
    {
      config: {
        rateLimit: {
          max: 3,
          timeWindow: "15 minutes",
        },
      },
    },
    async (request) => {
      const parsed = resetPasswordRequestSchema.safeParse(request.body);

      if (!parsed.success) {
        return {
          ok: true,
        };
      }

      const email = normalizeEmail(parsed.data.email);

      const result = await app.pg.query(
        `
          SELECT id, email
          FROM users
          WHERE email = $1
          LIMIT 1
        `,
        [email],
      );

      if (result.rowCount === 0) {
        return {
          ok: true,
        };
      }

      const user = result.rows[0];

      const token = await createPasswordResetToken(app.pg, user.id);

      await sendPasswordResetEmail(user.email, token);

      return {
        ok: true,
      };
    },
  );

  app.post(
    "/api/auth/reset-password/complete",
    {
      config: {
        rateLimit: {
          max: 10,
          timeWindow: "15 minutes",
        },
      },
    },
    async (request, reply) => {
      const token =
        typeof request.body?.token === "string" ? request.body.token : "";

      const parsed = updatePasswordSchema.safeParse({
        password: request.body?.password,
      });

      if (!token || !parsed.success) {
        return reply.code(400).send({
          error: "INVALID_INPUT",
          message: "Некорректный токен или пароль.",
        });
      }

      const tokenHash = hashAuthToken(token);

      const result = await app.pg.query(
        `
          SELECT
            id,
            user_id
          FROM auth_tokens
          WHERE token_hash = $1
            AND type = 'password_reset'
            AND used_at IS NULL
            AND expires_at > now()
          LIMIT 1
        `,
        [tokenHash],
      );

      if (result.rowCount === 0) {
        return reply.code(400).send({
          error: "INVALID_OR_EXPIRED_TOKEN",
          message: "Ссылка недействительна или истекла.",
        });
      }

      const authToken = result.rows[0];
      const passwordHash = await hashPassword(parsed.data.password);

      const client = await app.pg.connect();

      try {
        await client.query("BEGIN");

        await client.query(
          `
      UPDATE users
      SET password_hash = $1,
          updated_at = now()
      WHERE id = $2
    `,
          [passwordHash, authToken.user_id],
        );

        await client.query(
          `
      UPDATE auth_tokens
      SET used_at = now()
      WHERE id = $1
    `,
          [authToken.id],
        );

        await client.query(
          `
      DELETE FROM sessions
      WHERE user_id = $1
    `,
          [authToken.user_id],
        );

        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }

      return {
        ok: true,
        authenticated: false,
      };
    },
  );
}
