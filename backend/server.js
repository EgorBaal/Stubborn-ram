import "dotenv/config";

import Fastify from "fastify";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";

import { createDatabasePool } from "./modules/db/database.js";
import authRoutes from "./modules/auth/auth.routes.js";
import leadsRoutes from "./modules/leads/leads.routes.js";

const app = Fastify({
  logger: true,
});

const pool = createDatabasePool();

await app.register(cookie);

await app.register(cors, {
  origin: [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://stubbornram.ru",
  ],
  credentials: true,
});

await app.register(rateLimit, {
  global: false,
});

app.decorate("pg", pool);

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

const start = async () => {
  try {
    await pool.query("SELECT 1");

    app.log.info("PostgreSQL connection: OK");

    await app.listen({
      host: "127.0.0.1",
      port: 3000,
    });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

const shutdown = async () => {
  await app.close();
  await pool.end();
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

start();
