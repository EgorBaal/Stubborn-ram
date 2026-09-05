import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

import "../styles/TrainingPage.css";
import TrainingExerciseCard from "../components/cards/TrainingExerciseCard";
import TrainingComment from "../components/comment/TrainingComment";
import TrainingInfo from "../components/info/TrainingInfo";
import {
  getWorkoutById,
  saveCompletedWorkout,
  updateWorkout,
} from "../services/trainingService";

export default function TrainingPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const isTemplateTraining = location.pathname.startsWith(
    "/app/training/template/",
  );

  const isHistoryTraining = Boolean(id) && !isTemplateTraining;

  const [trainingTitle, setTrainingTitle] = useState("Новая тренировка");
  const [trainingDate, setTrainingDate] = useState(new Date());

  const [startTime, setStartTime] = useState(() =>
    new Date().toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  );

  const [endTime, setEndTime] = useState("");
  const [trainingType, setTrainingType] = useState("Силовая");
  const [trainingComment, setTrainingComment] = useState("");

  const [exerciseCards, setExerciseCards] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingWorkout, setIsLoadingWorkout] = useState(false);
  const [addButtonRipple, setAddButtonRipple] = useState(null);

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isStartTimePickerOpen, setIsStartTimePickerOpen] = useState(false);
  const [isEndTimePickerOpen, setIsEndTimePickerOpen] = useState(false);
  useEffect(() => {
    if (!isHistoryTraining || !id) {
      return;
    }

    let isMounted = true;

    const loadWorkout = async () => {
      setIsLoadingWorkout(true);

      try {
        const workout = await getWorkoutById(id);

        if (!isMounted) {
          return;
        }

        setTrainingTitle(workout.title || "Новая тренировка");

        if (workout.training_date) {
          const [year, month, day] = workout.training_date
            .split("-")
            .map(Number);

          setTrainingDate(new Date(year, month - 1, day));
        }

        setStartTime(workout.start_time || "");
        setEndTime(workout.end_time || "");
        setTrainingType(workout.training_type || "Силовая");
        setTrainingComment(workout.comment || "");

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
      } catch (loadError) {
        console.error("Ошибка загрузки тренировки:", loadError);

        if (!isMounted) {
          return;
        }

        window.alert(loadError?.message || "Не удалось загрузить тренировку.");
      } finally {
        if (isMounted) {
          setIsLoadingWorkout(false);
        }
      }
    };

    loadWorkout();

    return () => {
      isMounted = false;
    };
  }, [id, isHistoryTraining]);

  const handleAddExercise = (event) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setAddButtonRipple({
      x,
      y,
      id: Date.now(),
    });

    setTimeout(() => {
      setExerciseCards((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          supersetAfter: false,
        },
      ]);

      setAddButtonRipple(null);
    }, 180);
  };

  const handleToggleSuperset = (exerciseId) => {
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

  const handleFinishWorkout = async () => {
    if (isSaving) {
      return;
    }

    const invalidExercise = exerciseCards.find(
      (exercise) => !exercise.exerciseId,
    );

    if (invalidExercise) {
      window.alert(
        "Выберите упражнение из списка перед завершением тренировки.",
      );
      return;
    }

    setIsSaving(true);

    try {
      if (isHistoryTraining) {
        await updateWorkout({
          workoutId: id,
          title: trainingTitle,
          trainingDate,
          startTime,
          endTime,
          trainingType,
          comment: trainingComment,
          exercises: exerciseCards,
        });
      } else {
        await saveCompletedWorkout({
          title: trainingTitle,
          trainingDate,
          startTime,
          endTime,
          trainingType,
          comment: trainingComment,
          exercises: exerciseCards,
        });
      }

      navigate("/app/training");
    } catch (error) {
      console.error("Ошибка сохранения тренировки:", error);

      window.alert(
        error?.message ||
          "Не удалось сохранить тренировку. Попробуйте ещё раз.",
      );
    } finally {
      setIsSaving(false);
    }
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

  return (
    <main className="training-builder-view">
      <header className="training-builder-topbar">
        <div className="training-builder-side">
          <button
            type="button"
            className="training-builder-back"
            onClick={() => navigate(-1)}
            aria-label="Назад"
          >
            <ChevronLeft aria-hidden="true" />
          </button>
        </div>

        <h1 className="training-builder-title">{trainingTitle}</h1>

        <div className="training-builder-side">
          <button
            type="button"
            className="training-builder-edit"
            onClick={handleFinishWorkout}
            disabled={isSaving}
          >
            {isSaving ? "Сохранение..." : "Завершить"}
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
          setEndTime={setEndTime}
          trainingType={trainingType}
          setTrainingType={setTrainingType}
          isDatePickerOpen={isDatePickerOpen}
          setIsDatePickerOpen={setIsDatePickerOpen}
          isStartTimePickerOpen={isStartTimePickerOpen}
          setIsStartTimePickerOpen={setIsStartTimePickerOpen}
          isEndTimePickerOpen={isEndTimePickerOpen}
          setIsEndTimePickerOpen={setIsEndTimePickerOpen}
        />

        <TrainingComment
          value={trainingComment}
          onChange={setTrainingComment}
        />

        {exerciseCards.map((exercise, index) => {
          const previousExercise = exerciseCards[index - 1];

          const isSupersetMember = Boolean(previousExercise?.supersetAfter);

          return (
            <TrainingExerciseCard
              key={exercise.id}
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
              onChange={(data) => {
                setExerciseCards((prev) =>
                  prev.map((item) =>
                    item.id === exercise.id
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
              }}
            />
          );
        })}

        <button
          type="button"
          className="training-exercise-add-button"
          onClick={handleAddExercise}
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
      </section>
    </main>
  );
}
