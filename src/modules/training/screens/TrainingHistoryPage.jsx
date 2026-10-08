import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "../styles/TrainingPage.css";
import TrainingContent from "../components/common/TrainingContent";
import EmptyState from "../components/common/EmptyState";
import TrainingTabs from "../components/common/TrainingTabs";
import TrainingHistoryList from "../components/history/TrainingHistoryList";
import {
  deleteWorkout,
  getWorkoutById,
  getWorkouts,
  startWorkout,
} from "../services/trainingService";

const LOADING_DELAY_MS = 100;

export default function TrainingHistoryPage() {
  const navigate = useNavigate();

  const [workouts, setWorkouts] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLoadingState, setShowLoadingState] = useState(false);
  const [error, setError] = useState("");
  const [deletingWorkoutId, setDeletingWorkoutId] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadingTimer = window.setTimeout(() => {
      if (isMounted) {
        setShowLoadingState(true);
      }
    }, LOADING_DELAY_MS);

    const loadWorkouts = async () => {
      setIsLoading(true);
      setError("");

      try {
        const data = await getWorkouts();

        if (!isMounted) {
          return;
        }

        setWorkouts(data);
      } catch (loadError) {
        console.error("Ошибка загрузки истории тренировок:", loadError);

        if (!isMounted) {
          return;
        }

        setError(
          loadError?.message || "Не удалось загрузить историю тренировок.",
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
          window.clearTimeout(loadingTimer);
        }
      }
    };

    loadWorkouts();

    return () => {
      isMounted = false;
      window.clearTimeout(loadingTimer);
    };
  }, []);

  const handleDeleteWorkout = async (workoutId) => {
    if (!workoutId || deletingWorkoutId) {
      return;
    }

    setDeletingWorkoutId(workoutId);

    try {
      await deleteWorkout(workoutId);

      setWorkouts((prev) =>
        prev ? prev.filter((workout) => workout.id !== workoutId) : prev,
      );
    } catch (deleteError) {
      console.error("Ошибка удаления тренировки:", deleteError);

      window.alert(
        deleteError?.message ||
          "Не удалось удалить тренировку. Попробуйте ещё раз.",
      );
    } finally {
      setDeletingWorkoutId(null);
    }
  };

  const handleOpenWorkout = async (workout) => {
    if (!workout?.id) {
      return;
    }

    try {
      const fullWorkout = await getWorkoutById(workout.id);

      navigate(`/app/training/${workout.id}`, {
        replace: false,
        state: {
          trainingMode: "view",
          preloadedWorkout: fullWorkout,
        },
      });
    } catch (error) {
      console.error(
        "Ошибка загрузки тренировки при открытии из истории:",
        error,
      );
      window.alert(error?.message || "Не удалось открыть тренировку.");
    }
  };

  const handleCreateNewWorkout = async () => {
    const now = new Date();

    try {
      const data = await startWorkout({
        title: "Новая тренировка",
        trainingDate: now,
        startTime: now.toLocaleTimeString("ru-RU", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      });

      if (!data?.id) {
        throw new Error("Сервер не вернул ID новой тренировки.");
      }

      navigate(`/app/training/${data.id}`, {
        replace: true,
        state: {
          trainingMode: "edit",
        },
      });
    } catch (error) {
      console.error("Ошибка создания новой тренировки:", error);
      window.alert(error?.message || "Не удалось создать новую тренировку.");
    }
  };

  return (
    <main className="training-view training-history-view">
      <TrainingTabs
        activeTab="history"
        onHistoryClick={() => navigate("/app/training")}
        onTemplatesClick={() => navigate("/app/training/templates")}
        onExercisesClick={() => navigate("/app/training/exercises")}
      />

      <button
        type="button"
        className="training-primary-action"
        onClick={handleCreateNewWorkout}
      >
        Создать тренировку
      </button>

      <TrainingContent>
        {isLoading && showLoadingState ? (
          <EmptyState
            title="История тренировок"
            description="Загружаем сохранённые тренировки."
          />
        ) : error ? (
          <EmptyState
            title="Не удалось загрузить историю"
            description={error}
          />
        ) : workouts === null ? null : workouts.length === 0 ? (
          <EmptyState
            title="История тренировок"
            description="Создайте первую тренировку, чтобы начать вести историю."
          />
        ) : (
          <TrainingHistoryList
            workouts={workouts}
            onDeleteWorkout={handleDeleteWorkout}
            deletingWorkoutId={deletingWorkoutId}
            onOpenWorkout={handleOpenWorkout}
          />
        )}
      </TrainingContent>
    </main>
  );
}
