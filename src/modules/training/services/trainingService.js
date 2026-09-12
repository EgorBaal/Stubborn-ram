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

  const response = await fetch(
    "https://api.stubbornram.ru/api/training/workouts",
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
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
    },
  );

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Пользователь не авторизован.");
    }

    const errorData = await response.json().catch(() => null);

    throw new Error(errorData?.error || "Не удалось сохранить тренировку.");
  }

  return response.json();
}

export async function getCompletedWorkouts() {
  const response = await fetch(
    "https://api.stubbornram.ru/api/training/workouts",
    {
      credentials: "include",
    },
  );

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Пользователь не авторизован.");
    }

    throw new Error("Не удалось загрузить историю тренировок.");
  }

  const { workouts } = await response.json();

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

  const response = await fetch(
    `https://api.stubbornram.ru/api/training/workouts/${workoutId}`,
    {
      credentials: "include",
    },
  );

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Пользователь не авторизован.");
    }

    if (response.status === 404) {
      throw new Error("Тренировка не найдена.");
    }

    throw new Error("Не удалось загрузить тренировку.");
  }

  const workout = await response.json();

  return {
    ...workout,
    training_date: workout.training_date
      ? String(workout.training_date).slice(0, 10)
      : "",
    start_time: workout.start_time
      ? String(workout.start_time).slice(11, 16)
      : "",

    end_time: workout.end_time ? String(workout.end_time).slice(11, 16) : "",
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

  const response = await fetch(
    `https://api.stubbornram.ru/api/training/workouts/${workoutId}`,
    {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
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
    },
  );

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Пользователь не авторизован.");
    }

    if (response.status === 404) {
      throw new Error("Тренировка не найдена.");
    }

    const errorData = await response.json().catch(() => null);

    throw new Error(errorData?.message || "Не удалось обновить тренировку.");
  }

  return response.json();
}

export async function deleteWorkout(workoutId) {
  if (!workoutId) {
    throw new Error("Не указан ID тренировки.");
  }

  const response = await fetch(
    `https://api.stubbornram.ru/api/training/workouts/${workoutId}`,
    {
      method: "DELETE",
      credentials: "include",
    },
  );

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Пользователь не авторизован.");
    }

    if (response.status === 404) {
      throw new Error("Тренировка не найдена.");
    }

    const errorData = await response.json().catch(() => null);

    throw new Error(errorData?.message || "Не удалось удалить тренировку.");
  }

  return response.json();
}
