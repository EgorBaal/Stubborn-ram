require("dotenv").config({ path: "./backend/.env" });
const { Client } = require("./node_modules/pg");
const fs = require("fs");

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

client.connect()
  .then(() => client.query(fs.readFileSync("./backend/check-fk.sql", "utf8")))
  .then(result => {
    console.table(result.rows);
    return client.end();
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
