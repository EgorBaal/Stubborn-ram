import { useNavigate } from "react-router-dom";

import "./TrainingPage.css";

export default function TrainingHistoryPage() {
  const navigate = useNavigate();

  return (
    <main className="training-view">
      <header className="training-tabs" aria-label="Разделы тренировок">
        <button
          type="button"
          className="training-tabs__item is-active"
          onClick={() => navigate("/app/training")}
          aria-pressed="true"
        >
          История
        </button>

        <button
          type="button"
          className="training-tabs__item"
          onClick={() => navigate("/app/training/templates")}
          aria-pressed="false"
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

      <button
        type="button"
        className="training-primary-action"
        onClick={() => navigate("/app/training/create")}
      >
        Создать тренировку
      </button>

      <section className="training-content" aria-live="polite">
        <div className="training-empty-state">
          <h1>История тренировок</h1>

          <p>Создайте первую тренировку, чтобы начать вести историю.</p>
        </div>
      </section>
    </main>
  );
}
