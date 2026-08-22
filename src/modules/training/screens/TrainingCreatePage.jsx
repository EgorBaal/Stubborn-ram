import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import "../styles/TrainingPage.css";

import TrainingContent from "../components/common/TrainingContent";
import TrainingCreateList from "../components/create/TrainingCreateList";

export default function TrainingCreatePage() {
  const navigate = useNavigate();

  return (
    <main className="training-view">
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
        onClick={() => navigate("/app/training/new")}
      >
        Новая тренировка
      </button>

      <TrainingContent>
        <TrainingCreateList />
      </TrainingContent>
    </main>
  );
}
