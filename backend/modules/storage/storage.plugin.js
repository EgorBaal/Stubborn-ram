import fp from "fastify-plugin";
import * as storage from "./storage.service.js";

async function storagePlugin(app) {
  app.decorate("storage", storage);
}

export default fp(storagePlugin);
