import { supabase } from "@/shared/lib/supabaseClient";

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
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error("Пользователь не авторизован.");
  }

  const preparedExercises = exercises
    .map((exercise, index) => ({
      ...exercise,
      position: index,
    }))
    .filter((exercise) => exercise.exerciseId);

  const workoutPayload = {
    user_id: user.id,
    title: title?.trim() || "Новая тренировка",
    training_date: formatDateForDatabase(trainingDate),
    start_time: normalizeValue(startTime),
    end_time: normalizeValue(endTime),
    training_type: trainingType || "Силовая",
    comment: comment?.trim() || null,
    status: "completed",
    completed_at: new Date().toISOString(),
  };

  const { data: workout, error: workoutError } = await supabase
    .from("workouts")
    .insert(workoutPayload)
    .select("id")
    .single();

  if (workoutError) {
    throw workoutError;
  }

  try {
    for (const exercise of preparedExercises) {
      const { data: workoutExercise, error: workoutExerciseError } =
        await supabase
          .from("workout_exercises")
          .insert({
            workout_id: workout.id,
            exercise_id: exercise.exerciseId,
            position: exercise.position,
            exercise_comment: exercise.exerciseComment?.trim() || null,
            superset_after: Boolean(exercise.supersetAfter),
          })
          .select("id")
          .single();

      if (workoutExerciseError) {
        throw workoutExerciseError;
      }

      const preparedSets = (exercise.sets || []).map((set, index) => ({
        workout_exercise_id: workoutExercise.id,
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
        intensity_methods: Array.isArray(set.intensityMethods)
          ? set.intensityMethods
          : [],
      }));

      if (preparedSets.length === 0) {
        continue;
      }

      const { error: setsError } = await supabase
        .from("workout_sets")
        .insert(preparedSets);

      if (setsError) {
        throw setsError;
      }
    }

    return workout;
  } catch (error) {
    await supabase.from("workouts").delete().eq("id", workout.id);

    throw error;
  }
}

export async function getCompletedWorkouts() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error("Пользователь не авторизован.");
  }

  const { data, error } = await supabase
    .from("workouts")
    .select("id, title, training_date, created_at")
    .eq("user_id", user.id)
    .eq("status", "completed")
    .order("training_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data || []).map((workout) => ({
    id: workout.id,
    title: workout.title,
    createdAt: new Date(`${workout.training_date}T00:00:00`),
  }));
}

export async function getWorkoutById(workoutId) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error("Пользователь не авторизован.");
  }

  if (!workoutId) {
    throw new Error("Не указан ID тренировки.");
  }

  const { data, error } = await supabase
    .from("workouts")
    .select(
      `
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
      updated_at,
      workout_exercises (
        id,
        workout_id,
        exercise_id,
        position,
        exercise_comment,
        superset_after,
        exercises (
          id,
          name,
          muscle_group
        ),
        workout_sets (
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
        )
      )
    `,
    )
    .eq("id", workoutId)
    .eq("user_id", user.id)
    .single();

  if (error) {
    throw error;
  }

  return data;
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
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error("Пользователь не авторизован.");
  }

  if (!workoutId) {
    throw new Error("Не указан ID тренировки.");
  }

  const preparedExercises = exercises
    .map((exercise, index) => ({
      ...exercise,
      position: index,
    }))
    .filter((exercise) => exercise.exerciseId);

  const workoutPayload = {
    title: title?.trim() || "Новая тренировка",
    training_date: formatDateForDatabase(trainingDate),
    start_time: normalizeValue(startTime),
    end_time: normalizeValue(endTime),
    training_type: trainingType || "Силовая",
    comment: comment?.trim() || null,
    status: "completed",
    completed_at: new Date().toISOString(),
  };

  const { data: workout, error: workoutError } = await supabase
    .from("workouts")
    .update(workoutPayload)
    .eq("id", workoutId)
    .eq("user_id", user.id)
    .select("id")
    .single();

  if (workoutError) {
    throw workoutError;
  }

  try {
    const { data: existingExercises, error: existingExercisesError } =
      await supabase
        .from("workout_exercises")
        .select("id")
        .eq("workout_id", workoutId);

    if (existingExercisesError) {
      throw existingExercisesError;
    }

    const existingExerciseIds = (existingExercises || []).map(
      (exercise) => exercise.id,
    );

    if (existingExerciseIds.length > 0) {
      const { error: deleteSetsError } = await supabase
        .from("workout_sets")
        .delete()
        .in("workout_exercise_id", existingExerciseIds);

      if (deleteSetsError) {
        throw deleteSetsError;
      }

      const { error: deleteExercisesError } = await supabase
        .from("workout_exercises")
        .delete()
        .eq("workout_id", workoutId);

      if (deleteExercisesError) {
        throw deleteExercisesError;
      }
    }

    for (const exercise of preparedExercises) {
      const { data: workoutExercise, error: workoutExerciseError } =
        await supabase
          .from("workout_exercises")
          .insert({
            workout_id: workoutId,
            exercise_id: exercise.exerciseId,
            position: exercise.position,
            exercise_comment: exercise.exerciseComment?.trim() || null,
            superset_after: Boolean(exercise.supersetAfter),
          })
          .select("id")
          .single();

      if (workoutExerciseError) {
        throw workoutExerciseError;
      }

      const preparedSets = (exercise.sets || []).map((set, index) => ({
        workout_exercise_id: workoutExercise.id,
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
        intensity_methods: Array.isArray(set.intensityMethods)
          ? set.intensityMethods
          : [],
      }));

      if (preparedSets.length === 0) {
        continue;
      }

      const { error: setsError } = await supabase
        .from("workout_sets")
        .insert(preparedSets);

      if (setsError) {
        throw setsError;
      }
    }

    return workout;
  } catch (error) {
    throw error;
  }
}

export async function deleteWorkout(workoutId) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error("Пользователь не авторизован.");
  }

  if (!workoutId) {
    throw new Error("Не указан ID тренировки.");
  }

  const { error } = await supabase
    .from("workouts")
    .delete()
    .eq("id", workoutId)
    .eq("user_id", user.id);

  if (error) {
    throw error;
  }
}
