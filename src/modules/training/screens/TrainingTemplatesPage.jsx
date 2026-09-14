import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "../styles/TrainingPage.css";

export default function TrainingTemplatesPage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("templates");

  return (
    <main className="training-view training-templates-view">
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
        className="training-ready-programs-action"
        aria-label="Готовые программы"
      >
        <button
          type="button"
          className="training-secondary-action"
          onClick={() => navigate("/app/training/programs")}
        >
          Готовые программы
        </button>
      </div>

      <div
        className="training-secondary-actions"
        aria-label="Создание шаблонов и программ"
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
          onClick={() => navigate("/app/training/programs/create")}
        >
          Создать программу
        </button>
      </div>

      <div
        className="training-section-switcher"
        role="group"
        aria-label="Тип сохранённых тренировок"
      >
        <div
          className={`training-section-switcher__indicator ${
            activeSection === "programs" ? "is-programs" : ""
          }`}
        />

        <button
          type="button"
          className={`training-section-switcher__item ${
            activeSection === "templates" ? "is-active" : ""
          }`}
          onClick={() => setActiveSection("templates")}
          aria-pressed={activeSection === "templates"}
        >
          Шаблоны
        </button>

        <button
          type="button"
          className={`training-section-switcher__item ${
            activeSection === "programs" ? "is-active" : ""
          }`}
          onClick={() => setActiveSection("programs")}
          aria-pressed={activeSection === "programs"}
        >
          Программы
        </button>
      </div>

      <section className="training-content" aria-live="polite">
        {activeSection === "templates" ? (
          <div className="training-empty-state">
            <h1>Шаблоны тренировок</h1>
            <p>Здесь будут сохранённые шаблоны тренировок.</p>
          </div>
        ) : (
          <div className="training-empty-state">
            <h1>Программы</h1>
            <p>Здесь будут сохранённые программы тренировок.</p>
          </div>
        )}
      </section>
    </main>
  );
}
