require("dotenv").config({ path: require("path").join(__dirname, ".env") });
const { Client } = require("./node_modules/pg");

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

client
  .connect()
  .then(() =>
    client.query(`
      SELECT
        w.id AS workout_id,
        w.title,
        we.id AS workout_exercise_id,
        e.name AS exercise_name,
        ws.id AS set_id,
        ws.position
      FROM workouts w
      LEFT JOIN workout_exercises we
        ON we.workout_id = w.id
      LEFT JOIN exercises e
        ON e.id = we.exercise_id
      LEFT JOIN workout_sets ws
        ON ws.workout_exercise_id = we.id
      ORDER BY w.created_at DESC, we.position ASC, ws.position ASC
    `),
  )
  .then((result) => {
    console.table(result.rows);
    return client.end();
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
