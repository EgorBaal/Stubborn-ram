import { useNavigate } from "react-router-dom";

import "../styles/TrainingPage.css";

export default function TrainingTemplatesPage() {
  const navigate = useNavigate();

  return (
    <main className="training-view">
      <header className="training-tabs" aria-label="Разделы тренировок">
        <button
          type="button"
          className="training-tabs__item"
          onClick={() => navigate("/app/training")}
          aria-pressed="false"
        >
          История
        </button>

        <button
          type="button"
          className="training-tabs__item is-active"
          onClick={() => navigate("/app/training/templates")}
          aria-pressed="true"
        >
          Шаблоны
        </button>

        <button
          type="button"
          className="training-tabs__item"
          onClick={() => navigate("/app/training/exercises")}
          aria-pressed="false"
        >
          Упражнения
        </button>
      </header>

      <div
        className="training-secondary-actions"
        aria-label="Действия шаблонов"
      >
        <button
          type="button"
          className="training-secondary-action"
          onClick={() => navigate("/app/training/templates/create")}
        >
          Создать шаблон
        </button>

        <button
          type="button"
          className="training-secondary-action"
          onClick={() => navigate("/app/training/programs")}
        >
          Готовые программы
        </button>
      </div>

      <section className="training-content" aria-live="polite">
        <div className="training-empty-state">
          <h1>Шаблоны тренировок</h1>

          <p>Создайте первый шаблон или выберите готовую программу.</p>
        </div>
      </section>
    </main>
  );
}
