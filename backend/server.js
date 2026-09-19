import "dotenv/config";

import Fastify from "fastify";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";

import { createDatabasePool } from "./modules/db/database.js";
import authRoutes from "./modules/auth/auth.routes.js";
import leadsRoutes from "./modules/leads/leads.routes.js";
import trainingRoutes from "./modules/training/training.routes.js";
import mediaRoutes from "./modules/media/media.routes.js";
import storagePlugin from "./modules/storage/storage.plugin.js";

const app = Fastify({
  logger: true,
});

const pool = createDatabasePool();
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://stubbornram.ru",
];
const STATE_CHANGING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const SESSIONS_CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000;

let sessionsCleanupTimer = null;
let isSessionsCleanupRunning = false;

await app.register(cookie);

await app.register(cors, {
  origin: ALLOWED_ORIGINS,
  methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true,
});

await app.register(rateLimit, {
  global: false,
});

app.decorate("pg", pool);

async function cleanupExpiredSessions() {
  if (isSessionsCleanupRunning) {
    return;
  }

  isSessionsCleanupRunning = true;

  try {
    const result = await pool.query(
      `
        DELETE FROM sessions
        WHERE expires_at < now()
      `,
    );

    app.log.info(
      { deletedCount: result.rowCount ?? 0 },
      "Sessions cleanup completed",
    );
  } catch (error) {
    app.log.error({ error }, "Sessions cleanup failed");
  } finally {
    isSessionsCleanupRunning = false;
  }
}

function startSessionsCleanupScheduler() {
  if (sessionsCleanupTimer) {
    return;
  }

  sessionsCleanupTimer = setInterval(() => {
    cleanupExpiredSessions();
  }, SESSIONS_CLEANUP_INTERVAL_MS);

  // Run once on startup so stale rows do not wait until the first daily tick.
  cleanupExpiredSessions();
}

app.addHook("onRequest", async (request, reply) => {
  if (!request.url.startsWith("/api/")) {
    return;
  }

  if (!STATE_CHANGING_METHODS.has(request.method)) {
    return;
  }

  const originHeader = request.headers.origin;

  if (
    typeof originHeader !== "string" ||
    !ALLOWED_ORIGINS.includes(originHeader)
  ) {
    return reply.code(403).send({
      error: "INVALID_ORIGIN",
      message: "Источник запроса не разрешен.",
    });
  }
});

app.get("/health", async () => {
  const result = await pool.query("SELECT 1 AS ok");

  return {
    ok: true,
    service: "stubbornram-backend",
    database: result.rows[0].ok === 1,
  };
});

await app.register(authRoutes);
await app.register(leadsRoutes);
await app.register(trainingRoutes);
await app.register(storagePlugin);
await app.register(mediaRoutes);

const start = async () => {
  try {
    await pool.query("SELECT 1");

    app.log.info("PostgreSQL connection: OK");

    await app.listen({
      host: "127.0.0.1",
      port: 3000,
    });

    startSessionsCleanupScheduler();
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

const shutdown = async () => {
  if (sessionsCleanupTimer) {
    clearInterval(sessionsCleanupTimer);
    sessionsCleanupTimer = null;
  }

  await app.close();
  await pool.end();
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

start();
