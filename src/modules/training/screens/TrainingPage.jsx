import { ChevronLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import "../styles/TrainingPage.css";

export default function TrainingPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const isCreateMode = !id;
  const isViewMode = Boolean(id);

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

        <h1 className="training-builder-title">Тренировка</h1>

        <div className="training-builder-side">
          {isViewMode && (
            <button type="button" className="training-builder-edit">
              Изменить
            </button>
          )}
        </div>
      </header>

      <section
        className="training-builder-content"
        aria-label="Создание тренировки"
      >
        <div className="training-builder-empty" />
      </section>
    </main>
  );
}
