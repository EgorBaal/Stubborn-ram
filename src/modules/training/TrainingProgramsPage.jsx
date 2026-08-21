import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import "./TrainingPage.css";

export default function TrainingProgramsPage() {
  const navigate = useNavigate();

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

        <h1 className="training-builder-title">Готовые программы</h1>

        <div className="training-builder-side">
          <button type="button" className="training-builder-edit">
            Изменить
          </button>
        </div>
      </header>

      <section
        className="training-builder-content"
        aria-label="Готовые программы"
      >
        <div className="training-builder-empty" />
      </section>
    </main>
  );
}
