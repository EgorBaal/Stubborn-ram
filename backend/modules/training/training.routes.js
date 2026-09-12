import { getAuthenticatedUser } from "../auth/auth.session.js";
function combineDateAndTime(date, time) {
  if (!time) {
    return null;
  }

  return `${date}T${time}:00`;
}

export default async function trainingRoutes(app) {
  app.get("/api/training/exercises", async (request, reply) => {
    const authUser = await getAuthenticatedUser(app.pg, request);

    if (!authUser) {
      return reply.code(401).send({
        error: "UNAUTHENTICATED",
        message: "Требуется авторизация.",
      });
    }

    const result = await app.pg.query(
      `
        SELECT
          id,
          name,
          muscle_group
        FROM exercises
        WHERE user_id IS NULL
        ORDER BY name ASC
      `,
    );

    return {
      exercises: result.rows,
    };
  });
  app.get("/api/training/workouts", async (request, reply) => {
    const authUser = await getAuthenticatedUser(app.pg, request);

    if (!authUser) {
      return reply.code(401).send({
        error: "UNAUTHENTICATED",
        message: "Требуется авторизация.",
      });
    }

    const result = await app.pg.query(
      `
        SELECT
          id,
          title,
          training_date,
          created_at
        FROM workouts
        WHERE user_id = $1
          AND status = 'completed'
        ORDER BY training_date DESC, created_at DESC
      `,
      [authUser.userId],
    );

    return {
      workouts: result.rows.map((workout) => ({
        id: workout.id,
        title: workout.title,
        createdAt: workout.created_at,
      })),
    };
  });

  app.get("/api/training/workouts/:id", async (request, reply) => {
    const authUser = await getAuthenticatedUser(app.pg, request);

    if (!authUser) {
      return reply.code(401).send({
        error: "UNAUTHENTICATED",
        message: "Требуется авторизация.",
      });
    }

    const { id } = request.params;

    if (!id) {
      return reply.code(400).send({
        error: "INVALID_WORKOUT_ID",
        message: "Не указан ID тренировки.",
      });
    }

    const workoutResult = await app.pg.query(
      `
        SELECT
          id,
          user_id,
          title,
          training_date,
          start_time,
          end_time,
          training_type,
          comment,
          status,
          completed_at,
          created_at,
          updated_at
        FROM workouts
        WHERE id = $1
          AND user_id = $2
        LIMIT 1
      `,
      [id, authUser.userId],
    );

    if (workoutResult.rowCount === 0) {
      return reply.code(404).send({
        error: "WORKOUT_NOT_FOUND",
        message: "Тренировка не найдена.",
      });
    }

    const workout = workoutResult.rows[0];

    const exercisesResult = await app.pg.query(
      `
        SELECT
          we.id,
          we.workout_id,
          we.exercise_id,
          we.position,
          we.exercise_comment,
          we.superset_after,
          e.name,
          e.muscle_group
        FROM workout_exercises we
        JOIN exercises e ON e.id = we.exercise_id
        WHERE we.workout_id = $1
        ORDER BY we.position ASC
      `,
      [workout.id],
    );

    const exerciseIds = exercisesResult.rows.map((exercise) => exercise.id);

    let setsResult = { rows: [] };

    if (exerciseIds.length > 0) {
      setsResult = await app.pg.query(
        `
          SELECT
            id,
            workout_exercise_id,
            position,
            weight,
            repetitions,
            difficulty,
            distance,
            calories,
            speed,
            power,
            incline,
            time,
            rir,
            rpe,
            rest,
            intensity_methods
          FROM workout_sets
          WHERE workout_exercise_id = ANY($1::uuid[])
          ORDER BY workout_exercise_id, position ASC
        `,
        [exerciseIds],
      );
    }

    const setsByExerciseId = new Map();

    for (const set of setsResult.rows) {
      if (!setsByExerciseId.has(set.workout_exercise_id)) {
        setsByExerciseId.set(set.workout_exercise_id, []);
      }

      setsByExerciseId.get(set.workout_exercise_id).push(set);
    }

    return {
      id: workout.id,
      user_id: workout.user_id,
      title: workout.title,
      training_date: workout.training_date,
      start_time: workout.start_time,
      end_time: workout.end_time,
      training_type: workout.training_type,
      comment: workout.comment,
      status: workout.status,
      completed_at: workout.completed_at,
      created_at: workout.created_at,
      updated_at: workout.updated_at,
      workout_exercises: exercisesResult.rows.map((exercise) => ({
        id: exercise.id,
        workout_id: exercise.workout_id,
        exercise_id: exercise.exercise_id,
        position: exercise.position,
        exercise_comment: exercise.exercise_comment,
        superset_after: exercise.superset_after,
        exercises: {
          id: exercise.exercise_id,
          name: exercise.name,
          muscle_group: exercise.muscle_group,
        },
        workout_sets: setsByExerciseId.get(exercise.id) || [],
      })),
    };
  });

  app.post("/api/training/workouts", async (request, reply) => {
    const authUser = await getAuthenticatedUser(app.pg, request);

    if (!authUser) {
      return reply.code(401).send({
        error: "UNAUTHENTICATED",
        message: "Требуется авторизация.",
      });
    }

    const {
      title,
      trainingDate,
      startTime,
      endTime,
      trainingType,
      comment,
      exercises,
    } = request.body ?? {};

    if (!trainingDate) {
      return reply.code(400).send({
        error: "INVALID_TRAINING_DATE",
        message: "Не указана дата тренировки.",
      });
    }

    if (!Array.isArray(exercises)) {
      return reply.code(400).send({
        error: "INVALID_EXERCISES",
        message: "Поле exercises должно быть массивом.",
      });
    }

    const client = await app.pg.connect();

    try {
      await client.query("BEGIN");

      const workoutResult = await client.query(
        `
          INSERT INTO workouts (
            user_id,
            title,
            training_date,
            start_time,
            end_time,
            training_type,
            comment,
            status,
            completed_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, 'completed', now())
          RETURNING id
        `,
        [
          authUser.userId,
          title?.trim() || "Новая тренировка",
          trainingDate,
          combineDateAndTime(trainingDate, startTime),
          combineDateAndTime(trainingDate, endTime),
          trainingType || "Силовая",
          comment?.trim() || null,
        ],
      );

      const workoutId = workoutResult.rows[0].id;

      const preparedExercises = exercises
        .map((exercise, index) => ({
          ...exercise,
          position: index,
        }))
        .filter((exercise) => exercise.exerciseId);

      for (const exercise of preparedExercises) {
        const workoutExerciseResult = await client.query(
          `
            INSERT INTO workout_exercises (
              workout_id,
              exercise_id,
              position,
              exercise_comment,
              superset_after
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id
          `,
          [
            workoutId,
            exercise.exerciseId,
            exercise.position,
            exercise.exerciseComment?.trim() || null,
            Boolean(exercise.supersetAfter),
          ],
        );

        const workoutExerciseId = workoutExerciseResult.rows[0].id;

        const preparedSets = (exercise.sets || []).map((set, index) => [
          workoutExerciseId,
          index,
          set.weight === "" || set.weight === undefined ? null : set.weight,
          set.repetitions === "" || set.repetitions === undefined
            ? null
            : set.repetitions,
          set.difficulty === "" || set.difficulty === undefined
            ? null
            : set.difficulty,
          set.distance === "" || set.distance === undefined
            ? null
            : set.distance,
          set.calories === "" || set.calories === undefined
            ? null
            : set.calories,
          set.speed === "" || set.speed === undefined ? null : set.speed,
          set.power === "" || set.power === undefined ? null : set.power,
          set.incline === "" || set.incline === undefined ? null : set.incline,
          set.time === "" || set.time === undefined ? null : set.time,
          set.rir === "" || set.rir === undefined ? null : set.rir,
          set.rpe === "" || set.rpe === undefined ? null : set.rpe,
          set.rest === "" || set.rest === undefined ? null : set.rest,
          JSON.stringify(
            Array.isArray(set.intensityMethods) ? set.intensityMethods : [],
          ),
        ]);

        for (const setValues of preparedSets) {
          await client.query(
            `
              INSERT INTO workout_sets (
                workout_exercise_id,
                position,
                weight,
                repetitions,
                difficulty,
                distance,
                calories,
                speed,
                power,
                incline,
                time,
                rir,
                rpe,
                rest,
                intensity_methods
              )
              VALUES (
                $1, $2, $3, $4, $5,
                $6, $7, $8, $9, $10,
                $11, $12, $13, $14, $15
              )
            `,
            setValues,
          );
        }
      }

      await client.query("COMMIT");

      return reply.code(201).send({
        id: workoutId,
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  });
  app.put("/api/training/workouts/:id", async (request, reply) => {
    const authUser = await getAuthenticatedUser(app.pg, request);

    if (!authUser) {
      return reply.code(401).send({
        error: "UNAUTHENTICATED",
        message: "Требуется авторизация.",
      });
    }

    const { id } = request.params;

    if (!id) {
      return reply.code(400).send({
        error: "INVALID_WORKOUT_ID",
        message: "Не указан ID тренировки.",
      });
    }

    const {
      title,
      trainingDate,
      startTime,
      endTime,
      trainingType,
      comment,
      exercises,
    } = request.body ?? {};

    if (!trainingDate) {
      return reply.code(400).send({
        error: "INVALID_TRAINING_DATE",
        message: "Не указана дата тренировки.",
      });
    }

    if (!Array.isArray(exercises)) {
      return reply.code(400).send({
        error: "INVALID_EXERCISES",
        message: "Поле exercises должно быть массивом.",
      });
    }

    const client = await app.pg.connect();

    try {
      await client.query("BEGIN");

      const workoutResult = await client.query(
        `
          UPDATE workouts
          SET
            title = $1,
            training_date = $2,
            start_time = $3,
            end_time = $4,
            training_type = $5,
            comment = $6,
            status = 'completed',
            completed_at = now(),
            updated_at = now()
          WHERE id = $7
            AND user_id = $8
          RETURNING id
        `,
        [
          title?.trim() || "Новая тренировка",
          trainingDate,
          combineDateAndTime(trainingDate, startTime),
          combineDateAndTime(trainingDate, endTime),
          trainingType || "Силовая",
          comment?.trim() || null,
          id,
          authUser.userId,
        ],
      );

      if (workoutResult.rowCount === 0) {
        await client.query("ROLLBACK");

        return reply.code(404).send({
          error: "WORKOUT_NOT_FOUND",
          message: "Тренировка не найдена.",
        });
      }

      const existingExercisesResult = await client.query(
        `
          SELECT id
          FROM workout_exercises
          WHERE workout_id = $1
        `,
        [id],
      );

      const existingExerciseIds = existingExercisesResult.rows.map(
        (exercise) => exercise.id,
      );

      if (existingExerciseIds.length > 0) {
        await client.query(
          `
            DELETE FROM workout_sets
            WHERE workout_exercise_id = ANY($1::uuid[])
          `,
          [existingExerciseIds],
        );
      }

      await client.query(
        `
          DELETE FROM workout_exercises
          WHERE workout_id = $1
        `,
        [id],
      );

      const preparedExercises = exercises
        .map((exercise, index) => ({
          ...exercise,
          position: index,
        }))
        .filter((exercise) => exercise.exerciseId);

      for (const exercise of preparedExercises) {
        const workoutExerciseResult = await client.query(
          `
            INSERT INTO workout_exercises (
              workout_id,
              exercise_id,
              position,
              exercise_comment,
              superset_after
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id
          `,
          [
            id,
            exercise.exerciseId,
            exercise.position,
            exercise.exerciseComment?.trim() || null,
            Boolean(exercise.supersetAfter),
          ],
        );

        const workoutExerciseId = workoutExerciseResult.rows[0].id;

        const preparedSets = (exercise.sets || []).map((set, index) => [
          workoutExerciseId,
          index,
          set.weight === "" || set.weight === undefined ? null : set.weight,
          set.repetitions === "" || set.repetitions === undefined
            ? null
            : set.repetitions,
          set.difficulty === "" || set.difficulty === undefined
            ? null
            : set.difficulty,
          set.distance === "" || set.distance === undefined
            ? null
            : set.distance,
          set.calories === "" || set.calories === undefined
            ? null
            : set.calories,
          set.speed === "" || set.speed === undefined ? null : set.speed,
          set.power === "" || set.power === undefined ? null : set.power,
          set.incline === "" || set.incline === undefined ? null : set.incline,
          set.time === "" || set.time === undefined ? null : set.time,
          set.rir === "" || set.rir === undefined ? null : set.rir,
          set.rpe === "" || set.rpe === undefined ? null : set.rpe,
          set.rest === "" || set.rest === undefined ? null : set.rest,
          JSON.stringify(
            Array.isArray(set.intensityMethods) ? set.intensityMethods : [],
          ),
        ]);

        for (const setValues of preparedSets) {
          await client.query(
            `
              INSERT INTO workout_sets (
                workout_exercise_id,
                position,
                weight,
                repetitions,
                difficulty,
                distance,
                calories,
                speed,
                power,
                incline,
                time,
                rir,
                rpe,
                rest,
                intensity_methods
              )
              VALUES (
                $1, $2, $3, $4, $5,
                $6, $7, $8, $9, $10,
                $11, $12, $13, $14, $15
              )
            `,
            setValues,
          );
        }
      }

      await client.query("COMMIT");

      return {
        id,
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  });
  app.delete("/api/training/workouts/:id", async (request, reply) => {
    const authUser = await getAuthenticatedUser(app.pg, request);

    if (!authUser) {
      return reply.code(401).send({
        error: "UNAUTHENTICATED",
        message: "Требуется авторизация.",
      });
    }

    const { id } = request.params;

    if (!id) {
      return reply.code(400).send({
        error: "INVALID_WORKOUT_ID",
        message: "Не указан ID тренировки.",
      });
    }

    const result = await app.pg.query(
      `
        DELETE FROM workouts
        WHERE id = $1
          AND user_id = $2
        RETURNING id
      `,
      [id, authUser.userId],
    );

    if (result.rowCount === 0) {
      return reply.code(404).send({
        error: "WORKOUT_NOT_FOUND",
        message: "Тренировка не найдена.",
      });
    }

    return {
      id: result.rows[0].id,
    };
  });
}
