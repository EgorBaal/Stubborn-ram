import * as storage from "./storage.service.js";

export default async function storagePlugin(app) {
  app.decorate("storage", storage);
}
