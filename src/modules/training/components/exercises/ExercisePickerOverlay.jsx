import ExerciseList from "./ExerciseList";
import "./ExercisePickerOverlay.css";

export default function ExercisePickerOverlay({ onClose, onSelect }) {
  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="exercise-picker-overlay" onMouseDown={handleBackdropClick}>
      <section className="exercise-picker" aria-label="Выбор упражнения">
        <header className="exercise-picker__header">
          <h2 className="exercise-picker__title">Выбрать упражнение</h2>
        </header>

        <div className="exercise-picker__content">
          <ExerciseList onSelect={onSelect} />
        </div>
      </section>
    </div>
  );
}
