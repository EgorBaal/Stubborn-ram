import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import PageScroll from "@/components/app/PageScroll";

import "./TrainingPage.css";

export default function TrainingExerciseBuilderPage() {
  const navigate = useNavigate();

  return (
    <PageScroll className="training-page-scroll">
      <main className="training-builder-view">
        <header className="training-builder-topbar">
          <div className="training-builder-side training-builder-side--left">
            <button
              type="button"
              className="training-builder-back"
              onClick={() => navigate(-1)}
              aria-label="Назад"
            >
              <ChevronLeft aria-hidden="true" />
            </button>
          </div>

          <h1 className="training-builder-title">Создание упражнения</h1>

          <div className="training-builder-side training-builder-side--right">
            <button type="button" className="training-builder-edit">
              Изменить
            </button>
          </div>
        </header>

        <section
          className="training-builder-content"
          aria-label="Создание упражнения"
        >
          <div className="training-builder-empty" />
        </section>
      </main>
    </PageScroll>
  );
}
