import { useNavigate } from "react-router-dom";

import "./TrainingPage.css";

export default function TrainingExercisesPage() {
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
          className="training-tabs__item"
          onClick={() => navigate("/app/training/templates")}
          aria-pressed="false"
        >
          Шаблоны
        </button>

        <button
          type="button"
          className="training-tabs__item is-active"
          onClick={() => navigate("/app/training/exercises")}
          aria-pressed="true"
        >
          Упражнения
        </button>
      </header>

      <button
        type="button"
        className="training-primary-action"
        onClick={() => navigate("/app/training/exercises/create")}
      >
        Создать упражнение
      </button>

      <section className="training-content" aria-live="polite">
        <div className="training-empty-state training-empty-state--compact">
          <p>Раздел находится в разработке</p>
        </div>
      </section>
    </main>
  );
}
