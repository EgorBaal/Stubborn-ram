import { useNavigate } from "react-router-dom";

import "../styles/TrainingPage.css";
import TrainingContent from "../components/common/TrainingContent";
import EmptyState from "../components/common/EmptyState";
import TrainingTabs from "../components/common/TrainingTabs";

export default function TrainingHistoryPage() {
  const navigate = useNavigate();

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
        <EmptyState
          title="История тренировок"
          description="Создайте первую тренировку, чтобы начать вести историю."
        />
      </TrainingContent>
    </main>
  );
}
