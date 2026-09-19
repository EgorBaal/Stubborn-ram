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

  app.get("/api/training/sets/:setId/materials", async (request, reply) => {
    const authUser = await getAuthenticatedUser(app.pg, request);

    if (!authUser) {
      return reply.code(401).send({
        error: "UNAUTHENTICATED",
        message: "Требуется авторизация.",
      });
    }

    const { setId } = request.params;

    if (!setId) {
      return reply.code(400).send({
        error: "INVALID_SET_ID",
        message: "Не указан ID подхода.",
      });
    }

    const result = await app.pg.query(
      `
        SELECT
          n.id,
          n.workout_set_id,
          n.author_id,
          n.type,
          n.comment,
          n.created_at,
          n.updated_at,
          COALESCE(
            json_agg(
              json_build_object(
                'id', m.id,
                'originalName', m.original_name,
                'mimeType', m.mime_type,
                'sizeBytes', m.size_bytes,
                'status', m.status,
                'role', ml.role,
                'sortOrder', ml.sort_order
              )
              ORDER BY ml.sort_order NULLS LAST, ml.created_at ASC
            ) FILTER (WHERE m.id IS NOT NULL),
            '[]'::json
          ) AS media
        FROM training_set_notes n
        LEFT JOIN media_links ml
  ON ml.entity_type = 'workout_set'
 AND ml.entity_id = n.workout_set_id
 AND ml.role = n.type
 AND ml.media_id IS NOT NULL
        LEFT JOIN media m
          ON m.id = ml.media_id
        JOIN workout_sets ws
          ON ws.id = n.workout_set_id
        JOIN workout_exercises we
          ON we.id = ws.workout_exercise_id
        JOIN workouts w
          ON w.id = we.workout_id
        WHERE n.workout_set_id = $1
          AND w.user_id = $2
        GROUP BY
          n.id,
          n.workout_set_id,
          n.author_id,
          n.type,
          n.comment,
          n.created_at,
          n.updated_at
        ORDER BY n.type ASC
      `,
      [setId, authUser.userId],
    );

    return {
      materials: result.rows,
    };
  });

  app.put("/api/training/sets/:setId/materials", async (request, reply) => {
    const authUser = await getAuthenticatedUser(app.pg, request);

    if (!authUser) {
      return reply.code(401).send({
        error: "UNAUTHENTICATED",
        message: "Требуется авторизация.",
      });
    }

    const { setId } = request.params;
    const { comment, mediaIds } = request.body ?? {};

    if (!setId) {
      return reply.code(400).send({
        error: "INVALID_SET_ID",
        message: "Не указан ID подхода.",
      });
    }

    if (
      comment !== undefined &&
      comment !== null &&
      typeof comment !== "string"
    ) {
      return reply.code(400).send({
        error: "INVALID_COMMENT",
        message: "Комментарий должен быть строкой.",
      });
    }

    if (mediaIds !== undefined && !Array.isArray(mediaIds)) {
      return reply.code(400).send({
        error: "INVALID_MEDIA_IDS",
        message: "Поле mediaIds должно быть массивом.",
      });
    }

    const normalizedComment =
      typeof comment === "string" ? comment.trim() : null;

    const normalizedMediaIds = Array.isArray(mediaIds)
      ? [...new Set(mediaIds.filter(Boolean))]
      : [];

    if (normalizedMediaIds.length > 30) {
      return reply.code(400).send({
        error: "TOO_MANY_MEDIA",
        message: "Можно прикрепить не более 30 файлов.",
      });
    }

    const client = await app.pg.connect();

    try {
      await client.query("BEGIN");

      const setResult = await client.query(
        `
          SELECT ws.id
          FROM workout_sets ws
          JOIN workout_exercises we
            ON we.id = ws.workout_exercise_id
          JOIN workouts w
            ON w.id = we.workout_id
          WHERE ws.id = $1
            AND w.user_id = $2
          LIMIT 1
        `,
        [setId, authUser.userId],
      );

      if (setResult.rowCount === 0) {
        await client.query("ROLLBACK");

        return reply.code(404).send({
          error: "SET_NOT_FOUND",
          message: "Подход не найден.",
        });
      }

      if (normalizedMediaIds.length > 0) {
        const mediaResult = await client.query(
          `
            SELECT id, status
            FROM media
            WHERE id = ANY($1::uuid[])
              AND owner_id = $2
          `,
          [normalizedMediaIds, authUser.userId],
        );

        if (mediaResult.rowCount !== normalizedMediaIds.length) {
          await client.query("ROLLBACK");

          return reply.code(400).send({
            error: "INVALID_MEDIA",
            message: "Один или несколько файлов недоступны.",
          });
        }

        const notReadyMedia = mediaResult.rows.filter(
          (media) => media.status !== "READY",
        );

        if (notReadyMedia.length > 0) {
          await client.query("ROLLBACK");

          return reply.code(400).send({
            error: "MEDIA_NOT_READY",
            message: "Один или несколько файлов ещё не готовы.",
          });
        }
      }

      const oldLinksResult = await client.query(
        `
    SELECT
      ml.media_id,
      m.object_key
    FROM media_links ml
    JOIN media m
      ON m.id = ml.media_id
    WHERE ml.entity_type = 'workout_set'
      AND ml.entity_id = $1
      AND ml.role = 'CLIENT_NOTE'
  `,
        [setId],
      );

      const oldMedia = oldLinksResult.rows;

      const shouldDeleteNote =
        !normalizedComment && normalizedMediaIds.length === 0;

      if (shouldDeleteNote) {
        await client.query(
          `
            DELETE FROM training_set_notes
            WHERE workout_set_id = $1
              AND type = 'CLIENT_NOTE'
              AND author_id = $2
          `,
          [setId, authUser.userId],
        );
      } else {
        await client.query(
          `
            INSERT INTO training_set_notes (
              workout_set_id,
              author_id,
              type,
              comment
            )
            VALUES ($1, $2, 'CLIENT_NOTE', $3)
            ON CONFLICT (workout_set_id, type)
            DO UPDATE SET
              author_id = EXCLUDED.author_id,
              comment = EXCLUDED.comment,
              updated_at = now()
          `,
          [setId, authUser.userId, normalizedComment],
        );
      }

      await client.query(
        `
          DELETE FROM media_links
          WHERE entity_type = 'workout_set'
            AND entity_id = $1
            AND role = 'CLIENT_NOTE'
        `,
        [setId],
      );

      for (const [index, mediaId] of normalizedMediaIds.entries()) {
        await client.query(
          `
            INSERT INTO media_links (
              media_id,
              entity_type,
              entity_id,
              role,
              sort_order
            )
            VALUES ($1, 'workout_set', $2, 'CLIENT_NOTE', $3)
          `,
          [mediaId, setId, index],
        );
      }

      await client.query("COMMIT");

      for (const media of oldMedia) {
        if (normalizedMediaIds.includes(media.media_id)) {
          continue;
        }

        const usageResult = await app.pg.query(
          `
      SELECT 1
      FROM media_links
      WHERE media_id = $1
      LIMIT 1
    `,
          [media.media_id],
        );

        if (usageResult.rowCount > 0) {
          continue;
        }

        await app.storage.deleteObject(media.object_key);

        await app.pg.query(
          `
      DELETE FROM media
      WHERE id = $1
        AND owner_id = $2
    `,
          [media.media_id, authUser.userId],
        );
      }

      return {
        setId,
        type: "CLIENT_NOTE",
        comment: normalizedComment,
        mediaIds: normalizedMediaIds,
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
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

      const existingExerciseIds = new Set(
        existingExercisesResult.rows.map((exercise) => exercise.id),
      );

      const preparedExercises = exercises
        .map((exercise, index) => ({
          ...exercise,
          position: index,
        }))
        .filter((exercise) => exercise.exerciseId);

      const incomingExerciseIds = new Set();

      for (const exercise of preparedExercises) {
        const exerciseId = exercise.id;

        if (exerciseId && existingExerciseIds.has(exerciseId)) {
          incomingExerciseIds.add(exerciseId);

          await client.query(
            `
              UPDATE workout_exercises
              SET
                exercise_id = $1,
                position = $2,
                exercise_comment = $3,
                superset_after = $4
              WHERE id = $5
                AND workout_id = $6
            `,
            [
              exercise.exerciseId,
              exercise.position,
              exercise.exerciseComment?.trim() || null,
              Boolean(exercise.supersetAfter),
              exerciseId,
              id,
            ],
          );
        } else {
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

          exercise.id = workoutExerciseResult.rows[0].id;
          incomingExerciseIds.add(exercise.id);
        }

        const currentWorkoutExerciseId = exercise.id;

        const existingSetsResult = await client.query(
          `
            SELECT id
            FROM workout_sets
            WHERE workout_exercise_id = $1
          `,
          [currentWorkoutExerciseId],
        );

        const existingSetIds = new Set(
          existingSetsResult.rows.map((set) => set.id),
        );

        const incomingSetIds = new Set();

        for (const [index, set] of (exercise.sets || []).entries()) {
          const setId = set.id;

          const setValues = [
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
            set.incline === "" || set.incline === undefined
              ? null
              : set.incline,
            set.time === "" || set.time === undefined ? null : set.time,
            set.rir === "" || set.rir === undefined ? null : set.rir,
            set.rpe === "" || set.rpe === undefined ? null : set.rpe,
            set.rest === "" || set.rest === undefined ? null : set.rest,
            JSON.stringify(
              Array.isArray(set.intensityMethods) ? set.intensityMethods : [],
            ),
          ];

          if (setId && existingSetIds.has(setId)) {
            incomingSetIds.add(setId);

            await client.query(
              `
                UPDATE workout_sets
                SET
                  position = $1,
                  weight = $2,
                  repetitions = $3,
                  difficulty = $4,
                  distance = $5,
                  calories = $6,
                  speed = $7,
                  power = $8,
                  incline = $9,
                  time = $10,
                  rir = $11,
                  rpe = $12,
                  rest = $13,
                  intensity_methods = $14
                WHERE id = $15
                  AND workout_exercise_id = $16
              `,
              [...setValues, setId, currentWorkoutExerciseId],
            );
          } else {
            const workoutSetResult = await client.query(
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
                RETURNING id
              `,
              [currentWorkoutExerciseId, ...setValues],
            );

            set.id = workoutSetResult.rows[0].id;
            incomingSetIds.add(set.id);
          }
        }

        const setsToDelete = [...existingSetIds].filter(
          (setId) => !incomingSetIds.has(setId),
        );

        if (setsToDelete.length > 0) {
          await client.query(
            `
              DELETE FROM workout_sets
              WHERE id = ANY($1::uuid[])
                AND workout_exercise_id = $2
            `,
            [setsToDelete, currentWorkoutExerciseId],
          );
        }
      }

      const exercisesToDelete = [...existingExerciseIds].filter(
        (exerciseId) => !incomingExerciseIds.has(exerciseId),
      );

      if (exercisesToDelete.length > 0) {
        await client.query(
          `
            DELETE FROM workout_sets
            WHERE workout_exercise_id = ANY($1::uuid[])
          `,
          [exercisesToDelete],
        );

        await client.query(
          `
            DELETE FROM workout_exercises
            WHERE id = ANY($1::uuid[])
              AND workout_id = $2
          `,
          [exercisesToDelete, id],
        );
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
