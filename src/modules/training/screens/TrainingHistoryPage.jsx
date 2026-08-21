import { useNavigate } from "react-router-dom";

import "../styles/TrainingPage.css";
import TrainingContent from "../components/common/TrainingContent";
import EmptyState from "../components/common/EmptyState";
import TrainingTabs from "../components/common/TrainingTabs";
import TrainingHistoryList from "../components/history/TrainingHistoryList";

export default function TrainingHistoryPage() {
  const navigate = useNavigate();
  const demoWorkouts = [
    { id: 1, title: "Новая тренировка", createdAt: new Date("2026-08-20") },
    { id: 2, title: "Фулбади 1", createdAt: new Date("2026-08-18") },
    { id: 3, title: "Фулбади 2", createdAt: new Date("2026-08-17") },
    { id: 4, title: "Фулбади 3", createdAt: new Date("2026-08-16") },
    { id: 5, title: "Спина + Бицепс", createdAt: new Date("2026-08-15") },
    { id: 6, title: "Грудь + Трицепс", createdAt: new Date("2026-08-14") },
    { id: 7, title: "Ноги", createdAt: new Date("2026-08-13") },
    { id: 8, title: "Плечи", createdAt: new Date("2026-08-12") },
    { id: 9, title: "Верх тела", createdAt: new Date("2026-08-11") },
    { id: 10, title: "Низ тела", createdAt: new Date("2026-08-10") },
    { id: 11, title: "Фулбади 4", createdAt: new Date("2026-08-09") },
    { id: 12, title: "Фулбади 5", createdAt: new Date("2026-08-08") },

    { id: 13, title: "Грудь + Трицепс", createdAt: new Date("2026-07-30") },
    { id: 14, title: "Ноги", createdAt: new Date("2026-07-27") },
    { id: 15, title: "Плечи", createdAt: new Date("2026-07-23") },

    { id: 16, title: "Верх тела", createdAt: new Date("2026-06-28") },
    { id: 17, title: "Низ тела", createdAt: new Date("2026-06-20") },
  ];

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
        {demoWorkouts.length === 0 ? (
          <EmptyState
            title="История тренировок"
            description="Создайте первую тренировку, чтобы начать вести историю."
          />
        ) : (
          <TrainingHistoryList workouts={demoWorkouts} />
        )}
      </TrainingContent>
    </main>
  );
}
