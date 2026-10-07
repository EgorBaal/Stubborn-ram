import { request } from "../../../shared/lib/apiClient";

function formatDateForDatabase(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new Error("Некорректная дата тренировки.");
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function normalizeValue(value) {
  if (value === "" || value === undefined || value === null) {
    return null;
  }

  return value;
}

export async function saveCompletedWorkout({
  title,
  trainingDate,
  startTime,
  endTime,
  trainingType,
  comment,
  exercises,
}) {
  const preparedExercises = exercises
    .map((exercise, index) => ({
      ...exercise,
      position: index,
    }))
    .filter((exercise) => exercise.exerciseId);

  const { data, error } = await request("/training/workouts", {
    method: "POST",
    body: JSON.stringify({
      title: title?.trim() || "Новая тренировка",
      trainingDate: formatDateForDatabase(trainingDate),
      startTime: normalizeValue(startTime),
      endTime: normalizeValue(endTime),
      trainingType: trainingType || "Силовая",
      comment: comment?.trim() || null,
      exercises: preparedExercises.map((exercise) => ({
        exerciseId: exercise.exerciseId,
        position: exercise.position,
        exerciseComment: exercise.exerciseComment?.trim() || null,
        supersetAfter: Boolean(exercise.supersetAfter),
        sets: (exercise.sets || []).map((set, index) => ({
          position: index,
          weight: normalizeValue(set.weight),
          repetitions: normalizeValue(set.repetitions),
          difficulty: normalizeValue(set.difficulty),
          distance: normalizeValue(set.distance),
          calories: normalizeValue(set.calories),
          speed: normalizeValue(set.speed),
          power: normalizeValue(set.power),
          incline: normalizeValue(set.incline),
          time: normalizeValue(set.time),
          rir: normalizeValue(set.rir),
          rpe: normalizeValue(set.rpe),
          rest: normalizeValue(set.rest),
          intensityMethods: Array.isArray(set.intensityMethods)
            ? set.intensityMethods
            : [],
        })),
      })),
    }),
  });

  if (error) {
    if (error.error === "UNAUTHORIZED") {
      throw new Error("Пользователь не авторизован.");
    }

    throw new Error(
      error.message || error.error || "Не удалось сохранить тренировку.",
    );
  }

  return data;
}

export async function getExercises() {
  const { data, error, status } = await request("/training/exercises");

  if (error) {
    if (status === 401 || error.error === "UNAUTHORIZED") {
      throw new Error("Пользователь не авторизован.");
    }

    throw new Error(
      error.message || error.error || "Не удалось загрузить упражнения.",
    );
  }

  return data?.exercises ?? [];
}

export async function getExerciseById(exerciseId) {
  if (!exerciseId) {
    throw new Error("Не указан ID упражнения.");
  }

  const { data, error, status } = await request(
    `/training/exercises/${exerciseId}`,
  );

  if (error) {
    if (status === 401 || error.error === "UNAUTHORIZED") {
      throw new Error("Пользователь не авторизован.");
    }

    if (status === 404) {
      throw new Error("Упражнение не найдено.");
    }

    throw new Error(
      error.message || error.error || "Не удалось загрузить упражнение.",
    );
  }

  return data?.exercise ?? null;
}
export async function updateExercise({
  exerciseId,
  name,
  category,
  description,
  primaryMuscles,
  secondaryMuscles,
}) {
  if (!exerciseId) {
    throw new Error("Не указан ID упражнения.");
  }

  const normalizedName = typeof name === "string" ? name.trim() : "";

  const normalizedCategory =
    typeof category === "string" ? category.trim() : "";

  if (!normalizedName) {
    throw new Error("Не указано название упражнения.");
  }

  if (!normalizedCategory) {
    throw new Error("Не указана категория упражнения.");
  }

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

  const { data, error, status } = await request(
    `/training/exercises/${exerciseId}`,
    {
      method: "PUT",
      body: JSON.stringify({
        name: normalizedName,
        category: normalizedCategory,
        description:
          typeof description === "string" ? description.trim() : null,
        primaryMuscles: normalizedPrimaryMuscles,
        secondaryMuscles: normalizedSecondaryMuscles,
      }),
    },
  );

  if (error) {
    if (status === 401 || error.error === "UNAUTHORIZED") {
      throw new Error("Пользователь не авторизован.");
    }

    if (status === 404) {
      throw new Error("Личное упражнение не найдено.");
    }

    throw new Error(
      error.message || error.error || "Не удалось обновить упражнение.",
    );
  }

  return data?.exercise ?? null;
}
export async function createExercise({
  name,
  category,
  description,
  primaryMuscles,
  secondaryMuscles,
}) {
  const normalizedName = typeof name === "string" ? name.trim() : "";
  const normalizedCategory =
    typeof category === "string" ? category.trim() : "";

  if (!normalizedName) {
    throw new Error("Не указано название упражнения.");
  }

  if (!normalizedCategory) {
    throw new Error("Не указана категория упражнения.");
  }

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

  const { data, error, status } = await request("/training/exercises", {
    method: "POST",
    body: JSON.stringify({
      name: normalizedName,
      category: normalizedCategory,
      description: typeof description === "string" ? description.trim() : null,
      primaryMuscles: normalizedPrimaryMuscles,
      secondaryMuscles: normalizedSecondaryMuscles,
    }),
  });

  if (error) {
    if (status === 401 || error.error === "UNAUTHORIZED") {
      throw new Error("Пользователь не авторизован.");
    }

    throw new Error(
      error.message || error.error || "Не удалось создать упражнение.",
    );
  }

  return data?.exercise ?? null;
}

export async function getCompletedWorkouts() {
  const { data, error } = await request("/training/workouts");

  if (error) {
    if (error.error === "UNAUTHORIZED") {
      throw new Error("Пользователь не авторизован.");
    }

    throw new Error(
      error.message ||
        error.error ||
        "Не удалось загрузить историю тренировок.",
    );
  }

  const { workouts } = data || {};

  return (workouts || []).map((workout) => ({
    id: workout.id,
    title: workout.title,
    createdAt: new Date(`${workout.createdAt}`),
  }));
}

export async function getWorkoutById(workoutId) {
  if (!workoutId) {
    throw new Error("Не указан ID тренировки.");
  }

  const { data, error, status } = await request(
    `/training/workouts/${workoutId}`,
  );

  if (error) {
    if (status === 401 || error.error === "UNAUTHORIZED") {
      throw new Error("Пользователь не авторизован.");
    }

    if (status === 404) {
      throw new Error("Тренировка не найдена.");
    }

    throw new Error(
      error.message || error.error || "Не удалось загрузить тренировку.",
    );
  }

  const workout = data;

  return {
    ...workout,
    training_date: workout.training_date ? String(workout.training_date) : "",
    start_time: workout.start_time
      ? String(workout.start_time).slice(0, 5)
      : "",
    end_time: workout.end_time ? String(workout.end_time).slice(0, 5) : "",
  };
}

export async function updateWorkout({
  workoutId,
  title,
  trainingDate,
  startTime,
  endTime,
  trainingType,
  comment,
  exercises,
}) {
  if (!workoutId) {
    throw new Error("Не указан ID тренировки.");
  }

  const preparedExercises = exercises
    .map((exercise, index) => ({
      ...exercise,
      position: index,
    }))
    .filter((exercise) => exercise.exerciseId);

  const { data, error, status } = await request(
    `/training/workouts/${workoutId}`,
    {
      method: "PUT",
      body: JSON.stringify({
        title: title?.trim() || "Новая тренировка",
        trainingDate: formatDateForDatabase(trainingDate),
        startTime: normalizeValue(startTime),
        endTime: normalizeValue(endTime),
        trainingType: trainingType || "Силовая",
        comment: comment?.trim() || null,
        exercises: preparedExercises.map((exercise) => ({
          id: exercise.id,
          exerciseId: exercise.exerciseId,
          position: exercise.position,
          exerciseComment: exercise.exerciseComment?.trim() || null,
          supersetAfter: Boolean(exercise.supersetAfter),
          sets: (exercise.sets || []).map((set, index) => ({
            id: set.id,
            position: index,
            weight: normalizeValue(set.weight),
            repetitions: normalizeValue(set.repetitions),
            difficulty: normalizeValue(set.difficulty),
            distance: normalizeValue(set.distance),
            calories: normalizeValue(set.calories),
            speed: normalizeValue(set.speed),
            power: normalizeValue(set.power),
            incline: normalizeValue(set.incline),
            time: normalizeValue(set.time),
            rir: normalizeValue(set.rir),
            rpe: normalizeValue(set.rpe),
            rest: normalizeValue(set.rest),
            intensityMethods: Array.isArray(set.intensityMethods)
              ? set.intensityMethods
              : [],
          })),
        })),
      }),
    },
  );

  if (error) {
    if (status === 401 || error.error === "UNAUTHORIZED") {
      throw new Error("Пользователь не авторизован.");
    }

    if (status === 404) {
      throw new Error("Тренировка не найдена.");
    }

    throw new Error(
      error.message || error.error || "Не удалось обновить тренировку.",
    );
  }

  return data;
}

export async function deleteWorkout(workoutId) {
  if (!workoutId) {
    throw new Error("Не указан ID тренировки.");
  }

  const { data, error, status } = await request(
    `/training/workouts/${workoutId}`,
    {
      method: "DELETE",
    },
  );

  if (error) {
    if (status === 401 || error.error === "UNAUTHORIZED") {
      throw new Error("Пользователь не авторизован.");
    }

    if (status === 404) {
      throw new Error("Тренировка не найдена.");
    }

    throw new Error(
      error.message || error.error || "Не удалось удалить тренировку.",
    );
  }

  return data;
}
