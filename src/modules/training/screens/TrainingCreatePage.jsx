import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import "../styles/TrainingPage.css";

export default function TrainingCreatePage() {
  const navigate = useNavigate();
  const templates = [
    { id: 1, title: "Фулбади" },
    { id: 2, title: "Верх тела" },
    { id: 3, title: "Ноги" },
  ];

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
            <ChevronLeft />
          </button>
        </div>

        <h1 className="training-builder-title">Новая тренировка</h1>

        <div className="training-builder-side" />
      </header>

      <section className="training-builder-content">
        <TrainingCreateCard
          title="Новая тренировка"
          onClick={() => navigate("/app/training/new")}
        />

        <h2 className="training-create-title">Шаблоны</h2>

        {templates.map((template) => (
          <TrainingCreateCard
            key={template.id}
            title={template.title}
            onClick={() => {}}
          />
        ))}
      </section>
    </main>
  );
}
