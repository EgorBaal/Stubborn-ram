import { createPortal } from "react-dom";
import { useEffect } from "react";

import ExerciseList from "./ExerciseList";
import "./ExercisePickerOverlay.css";

export default function ExercisePickerOverlay({ onClose, onSelect }) {
  useEffect(() => {
    const scrollY = window.scrollY;

    const originalBodyOverflow = document.body.style.overflow;
    const originalBodyPosition = document.body.style.position;
    const originalBodyTop = document.body.style.top;
    const originalBodyWidth = document.body.style.width;

    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.body.style.position = originalBodyPosition;
      document.body.style.top = originalBodyTop;
      document.body.style.width = originalBodyWidth;

      window.scrollTo(0, scrollY);
    };
  }, []);

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const picker = (
    <div className="exercise-picker-overlay" onMouseDown={handleBackdropClick}>
      <section className="exercise-picker" aria-label="Выбор упражнения">
        <header className="exercise-picker__header">
          <h2 className="exercise-picker__title">Выбрать упражнение</h2>

          <button
            type="button"
            className="exercise-picker__close"
            onClick={onClose}
            aria-label="Закрыть выбор упражнения"
          >
            ×
          </button>
        </header>

        <div className="exercise-picker__content">
          <ExerciseList onSelect={onSelect} />
        </div>
      </section>
    </div>
  );

  return createPortal(picker, document.body);
}
