require("dotenv").config();

const Fastify = require("fastify");
const pool = require("./config/database");

const app = Fastify({
  logger: true,
});

const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || "127.0.0.1";

app.get("/health", async () => {
  return {
    status: "ok",
    service: "stubborn-ram-backend",
  };
});

const start = async () => {
  try {
    await app.listen({
      port,
      host,
    });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

start();
