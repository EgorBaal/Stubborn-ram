import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

import "../styles/TrainingPage.css";
import TrainingExerciseCard from "../components/cards/TrainingExerciseCard";
import TrainingComment from "../components/comment/TrainingComment";
import TrainingInfo from "../components/info/TrainingInfo";
import {
  getWorkoutById,
  startWorkout,
  updateWorkout,
} from "../services/trainingService";

export default function TrainingPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const isTemplateTraining = location.pathname.startsWith(
    "/app/training/template/",
  );
  const isNewWorkoutRoute = location.pathname === "/app/training/new";
  const isHistoryTraining = Boolean(id) && !isTemplateTraining;

  const getInitialScreenMode = () => {
    if (isNewWorkoutRoute || isTemplateTraining) {
      return "edit";
    }

    return location.state?.trainingMode === "edit" ? "edit" : "view";
  };

  const preloadedWorkout = location.state?.preloadedWorkout ?? null;

  const [trainingTitle, setTrainingTitle] = useState("Новая тренировка");
  const [trainingDate, setTrainingDate] = useState(new Date());

  const [startTime, setStartTime] = useState(() => {
    if (isHistoryTraining) {
      return "";
    }

    return new Date().toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });
  });

  const [endTime, setEndTime] = useState("");
  const [trainingType, setTrainingType] = useState("Силовая");
  const [trainingComment, setTrainingComment] = useState("");

  const [exerciseCards, setExerciseCards] = useState([]);
  const [workoutId, setWorkoutId] = useState(id || null);
  const [screenMode, setScreenMode] = useState(getInitialScreenMode);
  const [isExistingWorkoutLoading, setIsExistingWorkoutLoading] = useState(
    isHistoryTraining && !preloadedWorkout,
  );
  const hasStartedWorkoutRef = useRef(false);
  const hasCompletedInitialHydrationRef = useRef(false);
  const skipNextAutosaveRef = useRef(false);
  const [addButtonRipple, setAddButtonRipple] = useState(null);

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isStartTimePickerOpen, setIsStartTimePickerOpen] = useState(false);
  const [isEndTimePickerOpen, setIsEndTimePickerOpen] = useState(false);
  const hasManualEndTimeRef = useRef(false);

  const isEditMode = screenMode === "edit";
  const isViewMode = screenMode === "view";

  const hydrateWorkoutState = (workout) => {
    if (!workout) {
      return;
    }

    hasCompletedInitialHydrationRef.current = false;

    setTrainingTitle(workout.title || "Новая тренировка");

    if (workout.training_date) {
      const [year, month, day] = workout.training_date.split("-").map(Number);

      setTrainingDate(new Date(year, month - 1, day));
    }

    setStartTime(workout.start_time || "");
    setEndTime(workout.end_time || "");
    setTrainingType(workout.training_type || "Силовая");
    setTrainingComment(workout.comment || "");

    setWorkoutId(workout.id);

    const loadedExercises = [...(workout.workout_exercises || [])]
      .sort((a, b) => a.position - b.position)
      .map((exercise) => ({
        id: exercise.id,
        exerciseId: exercise.exercise_id,
        exerciseName: exercise.exercises?.name || "",
        exerciseComment: exercise.exercise_comment || "",
        supersetAfter: Boolean(exercise.superset_after),
        sets: [...(exercise.workout_sets || [])]
          .sort((a, b) => a.position - b.position)
          .map((set) => ({
            id: set.id,
            weight: set.weight ?? "",
            repetitions: set.repetitions ?? "",
            difficulty: set.difficulty ?? null,
            distance: set.distance ?? "",
            calories: set.calories ?? "",
            speed: set.speed ?? "",
            power: set.power ?? "",
            incline: set.incline ?? "",
            time: set.time ?? "",
            rir: set.rir ?? "",
            rpe: set.rpe ?? "",
            rest: set.rest ?? 0,
            intensityMethods: Array.isArray(set.intensity_methods)
              ? set.intensity_methods
              : [],
            isExtraOpen: false,
          })),
      }));

    setExerciseCards(loadedExercises);
    hasCompletedInitialHydrationRef.current = true;
    skipNextAutosaveRef.current = true;
  };

  useEffect(() => {
    if (isNewWorkoutRoute || isTemplateTraining) {
      setScreenMode("edit");
      setIsExistingWorkoutLoading(false);
      return;
    }

    if (isHistoryTraining) {
      const nextMode =
        location.state?.trainingMode === "edit" ? "edit" : "view";

      setScreenMode(nextMode);

      if (preloadedWorkout) {
        hydrateWorkoutState(preloadedWorkout);
        setIsExistingWorkoutLoading(false);
        return;
      }

      setIsExistingWorkoutLoading(true);
    }
  }, [
    isHistoryTraining,
    isNewWorkoutRoute,
    isTemplateTraining,
    location.state,
    preloadedWorkout,
  ]);

  useEffect(() => {
    if (
      isHistoryTraining ||
      isTemplateTraining ||
      workoutId ||
      hasStartedWorkoutRef.current
    ) {
      return;
    }

    hasStartedWorkoutRef.current = true;

    const createNewWorkout = async () => {
      try {
        const data = await startWorkout({
          title: trainingTitle,
          trainingDate,
          startTime,
          endTime,
          trainingType,
          comment: trainingComment,
        });

        if (!data?.id) {
          return;
        }

        hasCompletedInitialHydrationRef.current = true;
        setWorkoutId(data.id);
        skipNextAutosaveRef.current = true;
        navigate(`/app/training/${data.id}`, {
          replace: true,
          state: {
            trainingMode: "edit",
          },
        });
      } catch (startError) {
        console.error("Ошибка создания новой тренировки:", startError);

        window.alert(
          startError?.message || "Не удалось создать новую тренировку.",
        );
      }
    };

    createNewWorkout();
  }, [
    isHistoryTraining,
    isTemplateTraining,
    workoutId,
    trainingTitle,
    trainingDate,
    startTime,
    endTime,
    trainingType,
    trainingComment,
    navigate,
  ]);

  useEffect(() => {
    if (!isEditMode || !workoutId || !hasCompletedInitialHydrationRef.current) {
      return;
    }

    if (skipNextAutosaveRef.current) {
      skipNextAutosaveRef.current = false;
      return;
    }

    const timer = setTimeout(async () => {
      try {
        await updateWorkout({
          workoutId,
          title: trainingTitle,
          trainingDate,
          startTime,
          endTime,
          trainingType,
          comment: trainingComment,
          exercises: exerciseCards,
        });
      } catch (autosaveError) {
        console.error("Ошибка автосохранения тренировки:", autosaveError);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [
    isEditMode,
    workoutId,
    trainingTitle,
    trainingDate,
    startTime,
    endTime,
    trainingType,
    trainingComment,
    exerciseCards,
  ]);

  useEffect(() => {
    if (!isHistoryTraining || !id) {
      setIsExistingWorkoutLoading(false);
      return;
    }

    if (preloadedWorkout) {
      setIsExistingWorkoutLoading(false);
      return;
    }

    let isMounted = true;
    setIsExistingWorkoutLoading(true);

    const loadWorkout = async () => {
      try {
        const workout = await getWorkoutById(id);

        if (!isMounted) {
          return;
        }

        hydrateWorkoutState(workout);
        setIsExistingWorkoutLoading(false);
      } catch (loadError) {
        console.error("Ошибка загрузки тренировки:", loadError);

        if (!isMounted) {
          return;
        }

        setIsExistingWorkoutLoading(false);
        window.alert(loadError?.message || "Не удалось загрузить тренировку.");
      }
    };

    loadWorkout();

    return () => {
      isMounted = false;
    };
  }, [id, isHistoryTraining, preloadedWorkout]);

  const handleAddExercise = (event) => {
    if (!isEditMode || !workoutId) {
      return;
    }

    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setAddButtonRipple({
      x,
      y,
      id: Date.now(),
    });

    setExerciseCards((prev) => [
      ...prev,
      {
        id: `local-${crypto.randomUUID()}`,
        exerciseId: null,
        exerciseName: "",
        exerciseComment: "",
        sets: [],
        supersetAfter: false,
      },
    ]);

    setAddButtonRipple(null);
  };

  const handleExerciseChange = (exerciseId, data) => {
    setExerciseCards((prev) =>
      prev.map((item) =>
        item.id === exerciseId
          ? {
              ...item,
              exerciseId: data.exerciseId,
              exerciseName: data.exerciseName,
              exerciseComment: data.exerciseComment,
              sets: data.sets,
            }
          : item,
      ),
    );
  };

  const handleToggleSuperset = (exerciseId) => {
    if (!isEditMode) {
      return;
    }

    setExerciseCards((prev) =>
      prev.map((exercise) =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              supersetAfter: !exercise.supersetAfter,
            }
          : exercise,
      ),
    );
  };

  const handleRemoveExercise = (exerciseId) => {
    if (!isEditMode) {
      return;
    }

    setExerciseCards((prev) => {
      const index = prev.findIndex((exercise) => exercise.id === exerciseId);

      if (index === -1) {
        return prev;
      }

      const next = [...prev];

      next.splice(index, 1);

      if (index > 0 && index < prev.length) {
        const previousExercise = prev[index - 1];
        const removedExercise = prev[index];

        if (previousExercise.supersetAfter && removedExercise.supersetAfter) {
          next[index - 1] = {
            ...next[index - 1],
            supersetAfter: false,
          };
        }
      }

      return next;
    });
  };

  const handleEnableEditMode = () => {
    setScreenMode("edit");
  };

  const handleEndTimeChange = (nextValue) => {
    setEndTime(nextValue);

    if (nextValue && nextValue !== "--:--") {
      hasManualEndTimeRef.current = true;
      return;
    }

    hasManualEndTimeRef.current = false;
  };

  const handleCloseWorkout = async () => {
    if (!workoutId) {
      navigate("/app/training");
      return;
    }

    const closeEndTime = new Date().toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const finalEndTime = hasManualEndTimeRef.current ? endTime : closeEndTime;

    if (isEditMode && workoutId) {
      const nextEndTime = finalEndTime || "";

      setEndTime(nextEndTime);

      try {
        await updateWorkout({
          workoutId,
          title: trainingTitle,
          trainingDate,
          startTime,
          endTime: nextEndTime,
          trainingType,
          comment: trainingComment,
          exercises: exerciseCards,
        });
      } catch (closeError) {
        console.error(
          "Ошибка сохранения end_time при закрытии тренировки:",
          closeError,
        );
        window.alert(
          closeError?.message ||
            "Не удалось сохранить время завершения тренировки.",
        );
      }
    }

    navigate("/app/training");
  };

  const getExerciseNumbers = (exercises) => {
    let groupNumber = 0;
    let supersetLetterIndex = 0;

    return exercises.map((exercise, index) => {
      const previousExercise = exercises[index - 1];

      if (index === 0) {
        groupNumber = 1;

        if (exercise.supersetAfter) {
          supersetLetterIndex = 0;
          return `${groupNumber}A`;
        }

        return String(groupNumber);
      }

      if (previousExercise?.supersetAfter) {
        supersetLetterIndex += 1;

        return `${groupNumber}${String.fromCharCode(65 + supersetLetterIndex)}`;
      }

      groupNumber += 1;

      if (exercise.supersetAfter) {
        supersetLetterIndex = 0;
        return `${groupNumber}A`;
      }

      supersetLetterIndex = 0;

      return String(groupNumber);
    });
  };

  const exerciseNumbers = getExerciseNumbers(exerciseCards);

  if (isHistoryTraining && isExistingWorkoutLoading) {
    return (
      <main className="training-builder-view">
        <header className="training-builder-topbar">
          <div className="training-builder-side training-builder-side--left" />

          <h1 className="training-builder-title">Загрузка тренировки...</h1>

          <div className="training-builder-side training-builder-side--actions" />
        </header>

        <section
          className="training-builder-content"
          aria-label="Загрузка тренировки"
        >
          <div className="training-info">
            <h2 className="training-info__title">Информация</h2>
            <div className="training-info__card">
              <div className="training-info__row">
                <span className="training-info__label">Название</span>
                <span className="training-info__value">Загрузка...</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="training-builder-view">
      <header className="training-builder-topbar">
        <div className="training-builder-side training-builder-side--left">
          {isViewMode && (
            <button
              type="button"
              className="training-builder-edit"
              onClick={handleEnableEditMode}
            >
              Изменить
            </button>
          )}
        </div>

        <h1 className="training-builder-title">{trainingTitle}</h1>

        <div className="training-builder-side training-builder-side--actions">
          <button
            type="button"
            className="training-builder-edit"
            onClick={handleCloseWorkout}
          >
            Закрыть
          </button>
        </div>
      </header>

      <section className="training-builder-content" aria-label="Тренировка">
        <TrainingInfo
          trainingTitle={trainingTitle}
          setTrainingTitle={setTrainingTitle}
          trainingDate={trainingDate}
          setTrainingDate={setTrainingDate}
          startTime={startTime}
          setStartTime={setStartTime}
          endTime={endTime}
          setEndTime={handleEndTimeChange}
          trainingType={trainingType}
          setTrainingType={setTrainingType}
          isDatePickerOpen={isDatePickerOpen}
          setIsDatePickerOpen={setIsDatePickerOpen}
          isStartTimePickerOpen={isStartTimePickerOpen}
          setIsStartTimePickerOpen={setIsStartTimePickerOpen}
          isEndTimePickerOpen={isEndTimePickerOpen}
          setIsEndTimePickerOpen={setIsEndTimePickerOpen}
          isReadOnly={isViewMode}
        />

        <TrainingComment
          value={trainingComment}
          onChange={setTrainingComment}
          isReadOnly={isViewMode}
        />

        {exerciseCards.map((exercise, index) => {
          const previousExercise = exerciseCards[index - 1];

          const isSupersetMember = Boolean(previousExercise?.supersetAfter);

          return (
            <TrainingExerciseCard
              key={exercise.id}
              workoutId={workoutId}
              exerciseId={exercise.id}
              exerciseNumber={exerciseNumbers[index]}
              initialExerciseId={exercise.exerciseId}
              initialExerciseName={exercise.exerciseName}
              initialExerciseComment={exercise.exerciseComment}
              initialSets={exercise.sets}
              isSupersetActionSelected={exercise.supersetAfter}
              isSupersetMember={isSupersetMember}
              onToggleSuperset={handleToggleSuperset}
              onRemoveExercise={handleRemoveExercise}
              isReadOnly={isViewMode}
              onChange={(data) => handleExerciseChange(exercise.id, data)}
            />
          );
        })}

        {isEditMode && (
          <button
            type="button"
            className="training-exercise-add-button"
            onClick={handleAddExercise}
            disabled={!workoutId}
          >
            {addButtonRipple && (
              <span
                key={addButtonRipple.id}
                className="training-exercise-add-button__ripple"
                style={{
                  left: `${addButtonRipple.x}px`,
                  top: `${addButtonRipple.y}px`,
                }}
              />
            )}

            <span className="training-exercise-add-button__text">
              Добавить упражнение
            </span>
          </button>
        )}
      </section>
    </main>
  );
}
