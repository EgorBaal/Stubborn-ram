import { getAuthenticatedUser } from "../auth/auth.session.js";

const defaultTrackedParameters = ["weight", "repetitions", "difficulty"];
const supportedTrackedParameterIds = new Set([
  "weight",
  "repetitions",
  "difficulty",
  "distance",
  "calories",
  "speed",
  "power",
  "incline",
  "time",
  "rir",
  "rpe",
]);

function normalizeTrackedParameters(value) {
  if (Array.isArray(value)) {
    const next = [];

    for (const parameterId of value) {
      if (
        typeof parameterId === "string" &&
        supportedTrackedParameterIds.has(parameterId) &&
        !next.includes(parameterId)
      ) {
        next.push(parameterId);
      }
    }

    return next;
  }

  return [...defaultTrackedParameters];
}

async function workoutExerciseTrackedParametersEnabled(app) {
  const result = await app.pg.query(
    `
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'workout_exercises'
        AND column_name = 'tracked_parameters'
      LIMIT 1
    `,
  );

  return result.rowCount > 0;
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
  category,
  description,
  primary_muscles,
  secondary_muscles
FROM exercises
WHERE user_id IS NULL
   OR user_id = $1
ORDER BY name ASC
  `,
      [authUser.userId],
    );

    return {
      exercises: result.rows,
    };
  });
  app.get("/api/training/exercises/:id", async (request, reply) => {
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
        error: "INVALID_EXERCISE_ID",
        message: "Не указан ID упражнения.",
      });
    }

    const result = await app.pg.query(
      `
                SELECT
          id,
          name,
          category,
          description,
          primary_muscles,
          secondary_muscles,
          CASE
            WHEN user_id = $2 THEN true
            ELSE false
          END AS can_edit
        FROM exercises
WHERE id = $1
  AND (user_id IS NULL OR user_id = $2)
        LIMIT 1
      `,
      [id, authUser.userId],
    );

    if (result.rowCount === 0) {
      return reply.code(404).send({
        error: "EXERCISE_NOT_FOUND",
        message: "Упражнение не найдено.",
      });
    }

    return {
      exercise: result.rows[0],
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
          created_at,
          updated_at,
          comment
        FROM workouts
        WHERE user_id = $1
        ORDER BY training_date DESC, created_at DESC, id DESC
      `,
      [authUser.userId],
    );

    return {
      workouts: result.rows.map((workout) => ({
        id: workout.id,
        title: workout.title,
        trainingDate: workout.training_date,
        createdAt: workout.created_at,
        updatedAt: workout.updated_at,
        status: null,
        completed_at: null,
        comment: workout.comment,
      })),
    };
  });

  app.post("/api/training/workouts/start", async (request, reply) => {
    const authUser = await getAuthenticatedUser(app.pg, request);

    if (!authUser) {
      return reply.code(401).send({
        error: "UNAUTHENTICATED",
        message: "Требуется авторизация.",
      });
    }

    const { title, trainingDate, startTime, endTime, trainingType, comment } =
      request.body ?? {};

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
            comment
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING id
        `,
        [
          authUser.userId,
          title?.trim() || "Новая тренировка",
          trainingDate || new Date().toISOString().slice(0, 10),
          startTime || null,
          endTime || null,
          trainingType || "Силовая",
          comment?.trim() || null,
        ],
      );

      await client.query("COMMIT");

      return reply.code(201).send({
        id: workoutResult.rows[0].id,
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  });

  app.post("/api/training/exercises", async (request, reply) => {
    const authUser = await getAuthenticatedUser(app.pg, request);

    if (!authUser) {
      return reply.code(401).send({
        error: "UNAUTHENTICATED",
        message: "Требуется авторизация.",
      });
    }

    const { name, category, description, primaryMuscles, secondaryMuscles } =
      request.body ?? {};

    const normalizedName = typeof name === "string" ? name.trim() : "";
    const normalizedCategory =
      typeof category === "string" ? category.trim() : "";
    const normalizedPrimaryMuscles = Array.isArray(primaryMuscles)
      ? primaryMuscles.filter(
          (muscle) => typeof muscle === "string" && muscle.trim(),
        )
      : [];

    const normalizedSecondaryMuscles = Array.isArray(secondaryMuscles)
      ? secondaryMuscles.filter(
          (muscle) => typeof muscle === "string" && muscle.trim(),
        )
      : [];

    if (!normalizedName) {
      return reply.code(400).send({
        error: "INVALID_EXERCISE_NAME",
        message: "Не указано название упражнения.",
      });
    }

    if (!normalizedCategory) {
      return reply.code(400).send({
        error: "INVALID_CATEGORY",
        message: "Не указана категория упражнения.",
      });
    }

    const result = await app.pg.query(
      `
                INSERT INTO exercises (
          name,
          category,
          description,
          primary_muscles,
          secondary_muscles,
          user_id
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING
          id,
          name,
          category,
          description,
          primary_muscles,
          secondary_muscles
      `,
      [
        normalizedName,
        normalizedCategory,
        description?.trim() || null,
        normalizedPrimaryMuscles,
        normalizedSecondaryMuscles,
        authUser.userId,
      ],
    );

    return reply.code(201).send({
      exercise: result.rows[0],
    });
  });

  app.put("/api/training/exercises/:id", async (request, reply) => {
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
        error: "INVALID_EXERCISE_ID",
        message: "Не указан ID упражнения.",
      });
    }

    const { name, category, description, primaryMuscles, secondaryMuscles } =
      request.body ?? {};

    const normalizedName = typeof name === "string" ? name.trim() : "";

    const normalizedCategory =
      typeof category === "string" ? category.trim() : "";

    const normalizedDescription =
      typeof description === "string" ? description.trim() : null;

    const normalizedPrimaryMuscles = Array.isArray(primaryMuscles)
      ? primaryMuscles.filter(
          (muscle) => typeof muscle === "string" && muscle.trim(),
        )
      : [];

    const normalizedSecondaryMuscles = Array.isArray(secondaryMuscles)
      ? secondaryMuscles.filter(
          (muscle) => typeof muscle === "string" && muscle.trim(),
        )
      : [];

    if (!normalizedName) {
      return reply.code(400).send({
        error: "INVALID_EXERCISE_NAME",
        message: "Не указано название упражнения.",
      });
    }

    if (!normalizedCategory) {
      return reply.code(400).send({
        error: "INVALID_CATEGORY",
        message: "Не указана категория упражнения.",
      });
    }

    const result = await app.pg.query(
      `
                UPDATE exercises
        SET
          name = $1,
          category = $2,
          description = $3,
          primary_muscles = $4,
          secondary_muscles = $5,
          updated_at = current_timestamp
        WHERE id = $6
          AND user_id = $7
        RETURNING
          id,
          name,
          category,
          description,
          primary_muscles,
          secondary_muscles
      `,
      [
        normalizedName,
        normalizedCategory,
        normalizedDescription || null,
        normalizedPrimaryMuscles,
        normalizedSecondaryMuscles,
        id,
        authUser.userId,
      ],
    );

    if (result.rowCount === 0) {
      return reply.code(404).send({
        error: "EXERCISE_NOT_FOUND",
        message: "Личное упражнение не найдено.",
      });
    }

    return {
      exercise: result.rows[0],
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
  training_date::text AS training_date,
start_time::text AS start_time,
end_time::text AS end_time,
  training_type,
  comment,
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
    const trackedParametersEnabled =
      await workoutExerciseTrackedParametersEnabled(app);

    const exercisesResult = await app.pg.query(
      `
                SELECT
          we.id,
          we.workout_id,
          we.exercise_id,
          we.position,
          we.exercise_comment,
          we.superset_after,
          ${trackedParametersEnabled ? "we.tracked_parameters" : "NULL::jsonb AS tracked_parameters"},
          e.name,
          e.category
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
      status: null,
      completed_at: null,
      created_at: workout.created_at,
      updated_at: workout.updated_at,
      workout_exercises: exercisesResult.rows.map((exercise) => ({
        id: exercise.id,
        workout_id: exercise.workout_id,
        exercise_id: exercise.exercise_id,
        position: exercise.position,
        exercise_comment: exercise.exercise_comment,
        superset_after: exercise.superset_after,
        tracked_parameters: Array.isArray(exercise.tracked_parameters)
          ? exercise.tracked_parameters
          : exercise.tracked_parameters
            ? JSON.parse(exercise.tracked_parameters)
            : [...defaultTrackedParameters],
        exercises: {
          id: exercise.exercise_id,
          name: exercise.name,
          category: exercise.category,
        },
        workout_sets: setsByExerciseId.get(exercise.id) || [],
      })),
    };
  });

  app.put("/api/training/sets/:setId", async (request, reply) => {
    const authUser = await getAuthenticatedUser(app.pg, request);

    if (!authUser) {
      return reply.code(401).send({
        error: "UNAUTHENTICATED",
        message: "Требуется авторизация.",
      });
    }

    const { setId } = request.params;
    const patch = request.body ?? {};

    if (!setId) {
      return reply.code(400).send({
        error: "INVALID_SET_ID",
        message: "Не указан ID подхода.",
      });
    }

    if (!patch || typeof patch !== "object" || Array.isArray(patch)) {
      return reply.code(400).send({
        error: "INVALID_SET_PAYLOAD",
        message: "Невалидный payload для подхода.",
      });
    }

    const setCheckResult = await app.pg.query(
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

    if (setCheckResult.rowCount === 0) {
      return reply.code(404).send({
        error: "SET_NOT_FOUND",
        message: "Подход не найден.",
      });
    }

    const assignments = [];
    const values = [];
    let counter = 3;

    const addAssignment = (fieldName, value) => {
      if (Object.hasOwn(patch, fieldName)) {
        assignments.push(`${fieldName} = $${counter}`);
        values.push(value);
        counter += 1;
      }
    };

    addAssignment(
      "position",
      Number.isInteger(patch.position) ? patch.position : null,
    );
    addAssignment(
      "weight",
      patch.weight === "" || patch.weight === undefined ? null : patch.weight,
    );
    addAssignment(
      "repetitions",
      patch.repetitions === "" || patch.repetitions === undefined
        ? null
        : patch.repetitions,
    );
    addAssignment(
      "difficulty",
      patch.difficulty === "" || patch.difficulty === undefined
        ? null
        : patch.difficulty,
    );
    addAssignment(
      "distance",
      patch.distance === "" || patch.distance === undefined
        ? null
        : patch.distance,
    );
    addAssignment(
      "calories",
      patch.calories === "" || patch.calories === undefined
        ? null
        : patch.calories,
    );
    addAssignment(
      "speed",
      patch.speed === "" || patch.speed === undefined ? null : patch.speed,
    );
    addAssignment(
      "power",
      patch.power === "" || patch.power === undefined ? null : patch.power,
    );
    addAssignment(
      "incline",
      patch.incline === "" || patch.incline === undefined
        ? null
        : patch.incline,
    );
    addAssignment(
      "time",
      patch.time === "" || patch.time === undefined ? null : patch.time,
    );
    addAssignment(
      "rir",
      patch.rir === "" || patch.rir === undefined ? null : patch.rir,
    );
    addAssignment(
      "rpe",
      patch.rpe === "" || patch.rpe === undefined ? null : patch.rpe,
    );
    addAssignment(
      "rest",
      patch.rest === "" || patch.rest === undefined ? null : patch.rest,
    );

    if (Object.hasOwn(patch, "intensityMethods")) {
      assignments.push(`intensity_methods = $${counter}`);
      values.push(
        JSON.stringify(
          Array.isArray(patch.intensityMethods) ? patch.intensityMethods : [],
        ),
      );
      counter += 1;
    }

    if (assignments.length === 0) {
      return reply.code(400).send({
        error: "NO_SET_FIELDS_TO_UPDATE",
        message: "Нет полей для обновления.",
      });
    }

    const result = await app.pg.query(
      `
        UPDATE workout_sets ws
        SET ${assignments.join(", ")}
        WHERE ws.id = $1
          AND EXISTS (
            SELECT 1
            FROM workout_exercises we
            JOIN workouts w
              ON w.id = we.workout_id
            WHERE we.id = ws.workout_exercise_id
              AND w.user_id = $2
          )
        RETURNING ws.*
      `,
      [setId, authUser.userId, ...values],
    );

    return reply.send({
      set: result.rows[0] ?? null,
    });
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

  app.post("/api/training/workouts/:id/exercises", async (request, reply) => {
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

    const { exerciseId, exerciseComment, supersetAfter, trackedParameters } =
      request.body ?? {};

    if (!exerciseId) {
      return reply.code(400).send({
        error: "INVALID_EXERCISE_ID",
        message: "Не указан ID упражнения.",
      });
    }

    const workoutResult = await app.pg.query(
      `
        SELECT id
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

    const exerciseExists = await app.pg.query(
      `
        SELECT id
        FROM exercises
        WHERE id = $1
          AND (user_id IS NULL OR user_id = $2)
        LIMIT 1
      `,
      [exerciseId, authUser.userId],
    );

    if (exerciseExists.rowCount === 0) {
      return reply.code(404).send({
        error: "EXERCISE_NOT_FOUND",
        message: "Упражнение не найдено.",
      });
    }

    const positionResult = await app.pg.query(
      `
        SELECT COALESCE(MAX(position), -1) + 1 AS next_position
        FROM workout_exercises
        WHERE workout_id = $1
      `,
      [id],
    );

    const normalizedTrackedParameters =
      normalizeTrackedParameters(trackedParameters);

    const trackedParametersEnabled =
      await workoutExerciseTrackedParametersEnabled(app);
    const workoutExerciseQuery = trackedParametersEnabled
      ? `
        INSERT INTO workout_exercises (
          workout_id,
          exercise_id,
          position,
          exercise_comment,
          superset_after,
          tracked_parameters
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, position
      `
      : `
        INSERT INTO workout_exercises (
          workout_id,
          exercise_id,
          position,
          exercise_comment,
          superset_after
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, position
      `;

    const workoutExerciseArgs = trackedParametersEnabled
      ? [
          id,
          exerciseId,
          Number(positionResult.rows[0].next_position),
          typeof exerciseComment === "string"
            ? exerciseComment.trim() || null
            : null,
          Boolean(supersetAfter),
          JSON.stringify(normalizedTrackedParameters),
        ]
      : [
          id,
          exerciseId,
          Number(positionResult.rows[0].next_position),
          typeof exerciseComment === "string"
            ? exerciseComment.trim() || null
            : null,
          Boolean(supersetAfter),
        ];

    const workoutExerciseResult = await app.pg.query(
      workoutExerciseQuery,
      workoutExerciseArgs,
    );

    return reply.code(201).send({
      id: workoutExerciseResult.rows[0].id,
      position: workoutExerciseResult.rows[0].position,
    });
  });

  app.post(
    "/api/training/workouts/:id/exercises/:exerciseRowId/sets",
    async (request, reply) => {
      const authUser = await getAuthenticatedUser(app.pg, request);

      if (!authUser) {
        return reply.code(401).send({
          error: "UNAUTHENTICATED",
          message: "Требуется авторизация.",
        });
      }

      const { id, exerciseRowId } = request.params;
      const {
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
        intensityMethods,
      } = request.body ?? {};

      if (!exerciseRowId) {
        return reply.code(400).send({
          error: "INVALID_EXERCISE_ROW_ID",
          message: "Не указан ID упражнения в тренировке.",
        });
      }

      const exerciseResult = await app.pg.query(
        `
        SELECT we.id
        FROM workout_exercises we
        JOIN workouts w ON w.id = we.workout_id
        WHERE we.id = $1
          AND we.workout_id = $2
          AND w.user_id = $3
        LIMIT 1
      `,
        [exerciseRowId, id, authUser.userId],
      );

      if (exerciseResult.rowCount === 0) {
        return reply.code(404).send({
          error: "WORKOUT_EXERCISE_NOT_FOUND",
          message: "Упражнение в тренировке не найдено.",
        });
      }

      const positionResult = await app.pg.query(
        `
        SELECT COALESCE(MAX(position), -1) + 1 AS next_position
        FROM workout_sets
        WHERE workout_exercise_id = $1
      `,
        [exerciseRowId],
      );

      const setResult = await app.pg.query(
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
        RETURNING id, position
      `,
        [
          exerciseRowId,
          Number(positionResult.rows[0].next_position),
          weight === "" || weight === undefined || weight === null
            ? null
            : weight,
          repetitions === "" ||
          repetitions === undefined ||
          repetitions === null
            ? null
            : repetitions,
          difficulty === "" || difficulty === undefined || difficulty === null
            ? null
            : difficulty,
          distance === "" || distance === undefined || distance === null
            ? null
            : distance,
          calories === "" || calories === undefined || calories === null
            ? null
            : calories,
          speed === "" || speed === undefined || speed === null ? null : speed,
          power === "" || power === undefined || power === null ? null : power,
          incline === "" || incline === undefined || incline === null
            ? null
            : incline,
          time === "" || time === undefined || time === null ? null : time,
          rir === "" || rir === undefined || rir === null ? null : rir,
          rpe === "" || rpe === undefined || rpe === null ? null : rpe,
          rest === "" || rest === undefined || rest === null ? null : rest,
          JSON.stringify(
            Array.isArray(intensityMethods) ? intensityMethods : [],
          ),
        ],
      );

      return reply.code(201).send({
        id: setResult.rows[0].id,
        position: setResult.rows[0].position,
      });
    },
  );

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
            updated_at = now()
          WHERE id = $7
            AND user_id = $8
          RETURNING id
        `,
        [
          title?.trim() || "Новая тренировка",
          trainingDate,
          startTime || null,
          endTime || null,
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

          const trackedParametersEnabled =
            await workoutExerciseTrackedParametersEnabled(app);

          if (trackedParametersEnabled) {
            await client.query(
              `
                UPDATE workout_exercises
                SET
                  exercise_id = $1,
                  position = $2,
                  exercise_comment = $3,
                  superset_after = $4,
                  tracked_parameters = $5
                WHERE id = $6
                  AND workout_id = $7
              `,
              [
                exercise.exerciseId,
                exercise.position,
                exercise.exerciseComment?.trim() || null,
                Boolean(exercise.supersetAfter),
                JSON.stringify(
                  normalizeTrackedParameters(
                    exercise.trackedParameters ?? exercise.tracked_parameters,
                  ),
                ),
                exerciseId,
                id,
              ],
            );
          } else {
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
          }
        } else {
          const trackedParametersEnabled =
            await workoutExerciseTrackedParametersEnabled(app);
          const workoutExerciseQuery = trackedParametersEnabled
            ? `
              INSERT INTO workout_exercises (
                workout_id,
                exercise_id,
                position,
                exercise_comment,
                superset_after,
                tracked_parameters
              )
              VALUES ($1, $2, $3, $4, $5, $6)
              RETURNING id
            `
            : `
              INSERT INTO workout_exercises (
                workout_id,
                exercise_id,
                position,
                exercise_comment,
                superset_after
              )
              VALUES ($1, $2, $3, $4, $5)
              RETURNING id
            `;

          const workoutExerciseArgs = trackedParametersEnabled
            ? [
                id,
                exercise.exerciseId,
                exercise.position,
                exercise.exerciseComment?.trim() || null,
                Boolean(exercise.supersetAfter),
                JSON.stringify(
                  normalizeTrackedParameters(
                    exercise.trackedParameters ?? exercise.tracked_parameters,
                  ),
                ),
              ]
            : [
                id,
                exercise.exerciseId,
                exercise.position,
                exercise.exerciseComment?.trim() || null,
                Boolean(exercise.supersetAfter),
              ];

          const workoutExerciseResult = await client.query(
            workoutExerciseQuery,
            workoutExerciseArgs,
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

    const client = await app.pg.connect();

    try {
      await client.query("BEGIN");

      const workoutCheck = await client.query(
        `
          SELECT id
          FROM workouts
          WHERE id = $1
            AND user_id = $2
          LIMIT 1
        `,
        [id, authUser.userId],
      );

      if (workoutCheck.rowCount === 0) {
        await client.query("ROLLBACK");

        return reply.code(404).send({
          error: "WORKOUT_NOT_FOUND",
          message: "Тренировка не найдена.",
        });
      }

      const setIdsResult = await client.query(
        `
          SELECT ws.id AS set_id
          FROM workout_sets ws
          JOIN workout_exercises we
            ON we.id = ws.workout_exercise_id
          WHERE we.workout_id = $1
        `,
        [id],
      );

      const setIds = setIdsResult.rows.map((row) => row.set_id);

      const mediaIdsResult = await client.query(
        `
          SELECT DISTINCT ml.media_id
          FROM media_links ml
          WHERE ml.entity_type = 'workout_set'
            AND ml.entity_id = ANY($1::uuid[])
        `,
        [setIds],
      );

      const mediaIdsToDelete = mediaIdsResult.rows
        .map((row) => row.media_id)
        .filter(Boolean);

      if (setIds.length > 0) {
        await client.query(
          `
            DELETE FROM media_links
            WHERE entity_type = 'workout_set'
              AND entity_id = ANY($1::uuid[])
          `,
          [setIds],
        );
      }

      const mediaToDeleteResult = await client.query(
        `
          SELECT m.id, m.object_key
          FROM media m
          WHERE m.id = ANY($1::uuid[])
            AND m.owner_id = $2
            AND NOT EXISTS (
              SELECT 1
              FROM media_links ml
              WHERE ml.media_id = m.id
            )
        `,
        [mediaIdsToDelete, authUser.userId],
      );

      const mediaToDelete = mediaToDeleteResult.rows;

      if (mediaToDelete.length > 0) {
        await client.query(
          `
            DELETE FROM media
            WHERE id = ANY($1::uuid[])
              AND owner_id = $2
          `,
          [mediaToDelete.map((media) => media.id), authUser.userId],
        );
      }

      await client.query(
        `
          DELETE FROM workout_sets
          WHERE workout_exercise_id IN (
            SELECT id
            FROM workout_exercises
            WHERE workout_id = $1
          )
        `,
        [id],
      );

      await client.query(
        `
          DELETE FROM workout_exercises
          WHERE workout_id = $1
        `,
        [id],
      );

      const deleteResult = await client.query(
        `
          DELETE FROM workouts
          WHERE id = $1
            AND user_id = $2
          RETURNING id
        `,
        [id, authUser.userId],
      );

      await client.query("COMMIT");

      const objectDeleteFailures = [];

      for (const media of mediaToDelete) {
        try {
          await app.storage.deleteObject({
            key: media.object_key,
          });
        } catch (storageError) {
          objectDeleteFailures.push({
            mediaId: media.id,
            objectKey: media.object_key,
            error: storageError,
          });
        }
      }

      if (objectDeleteFailures.length > 0) {
        app.log.error(
          {
            workoutId: id,
            media: objectDeleteFailures,
          },
          "Workout deleted from DB but object storage cleanup failed for some media",
        );

        return reply.code(500).send({
          error: "WORKOUT_MEDIA_STORAGE_DELETE_FAILED",
          message:
            "Тренировка удалена из БД, но часть физических объектов в Object Storage не удалось удалить.",
          workoutId: id,
          failures: objectDeleteFailures.map(({ mediaId, objectKey }) => ({
            mediaId,
            objectKey,
          })),
        });
      }

      return {
        id: deleteResult.rows[0].id,
      };
    } catch (error) {
      await client.query("ROLLBACK").catch(() => {});
      throw error;
    } finally {
      client.release();
    }
  });
}
