import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import "../styles/TrainingPage.css";

import TrainingContent from "../components/common/TrainingContent";
import TrainingCreateList from "../components/create/TrainingCreateList";
import { startWorkout } from "../services/trainingService";

export default function TrainingCreatePage() {
  const navigate = useNavigate();

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
    <main className="training-view training-create-view">
      <header className="training-builder-topbar">
        <div className="training-builder-side">
          <button
            type="button"
            className="training-builder-back"
            onClick={() => navigate(-1)}
            aria-label="Назад"
          >
            <ChevronLeft />
          </button>
        </div>

        <div className="training-builder-side" />
      </header>

      <button
        type="button"
        className="training-primary-action"
        onClick={handleCreateNewWorkout}
      >
        Новая тренировка
      </button>

      <TrainingContent>
        <TrainingCreateList />
      </TrainingContent>
    </main>
  );
}
