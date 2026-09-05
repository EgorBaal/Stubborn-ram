import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "../styles/TrainingPage.css";
import TrainingContent from "../components/common/TrainingContent";
import EmptyState from "../components/common/EmptyState";
import TrainingTabs from "../components/common/TrainingTabs";
import TrainingHistoryList from "../components/history/TrainingHistoryList";
import {
  deleteWorkout,
  getCompletedWorkouts,
} from "../services/trainingService";

export default function TrainingHistoryPage() {
  const navigate = useNavigate();

  const [workouts, setWorkouts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingWorkoutId, setDeletingWorkoutId] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadWorkouts = async () => {
      setIsLoading(true);
      setError("");

      try {
        const data = await getCompletedWorkouts();

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
        }
      }
    };

    loadWorkouts();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleDeleteWorkout = async (workoutId) => {
    if (!workoutId || deletingWorkoutId) {
      return;
    }

    setDeletingWorkoutId(workoutId);

    try {
      await deleteWorkout(workoutId);

      setWorkouts((prev) => prev.filter((workout) => workout.id !== workoutId));
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

  return (
    <main className="training-view">
      <TrainingTabs
        activeTab="history"
        onHistoryClick={() => navigate("/app/training")}
        onTemplatesClick={() => navigate("/app/training/templates")}
        onExercisesClick={() => navigate("/app/training/exercises")}
      />

      <button
        type="button"
        className="training-primary-action"
        onClick={() => navigate("/app/training/create")}
      >
        Создать тренировку
      </button>

      <TrainingContent>
        {isLoading ? (
          <EmptyState
            title="История тренировок"
            description="Загружаем сохранённые тренировки."
          />
        ) : error ? (
          <EmptyState
            title="Не удалось загрузить историю"
            description={error}
          />
        ) : workouts.length === 0 ? (
          <EmptyState
            title="История тренировок"
            description="Создайте первую тренировку, чтобы начать вести историю."
          />
        ) : (
          <TrainingHistoryList
            workouts={workouts}
            onDeleteWorkout={handleDeleteWorkout}
            deletingWorkoutId={deletingWorkoutId}
          />
        )}
      </TrainingContent>
    </main>
  );
}
