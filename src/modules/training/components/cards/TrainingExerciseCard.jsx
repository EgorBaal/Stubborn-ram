import { useState } from "react";

import ExercisePickerOverlay from "../exercises/ExercisePickerOverlay";
import "./TrainingExerciseCard.css";

export default function TrainingExerciseCard() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isExercisePickerOpen, setIsExercisePickerOpen] = useState(false);
  const [exerciseName, setExerciseName] = useState("");
  const [exerciseComment, setExerciseComment] = useState("");

  const handleToggle = () => {
    setIsCollapsed((prev) => !prev);
  };

  return (
    <article className="training-exercise-card">
      <div className="training-exercise-card__row training-exercise-card__row--title">
        <input
          type="text"
          className="training-exercise-card__name-input"
          placeholder="Название упражнения"
          value={exerciseName}
          onChange={(event) => setExerciseName(event.target.value)}
        />

        <button
          type="button"
          className="training-exercise-card__toggle"
          onClick={handleToggle}
          aria-label={
            isCollapsed ? "Развернуть упражнение" : "Свернуть упражнение"
          }
          aria-expanded={!isCollapsed}
        >
          <svg
            className={`training-exercise-card__chevron${
              isCollapsed ? " training-exercise-card__chevron--collapsed" : ""
            }`}
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M9 6L15 12L9 18"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div
        className={`training-exercise-card__body${
          isCollapsed ? " training-exercise-card__body--collapsed" : ""
        }`}
      >
        <button
          type="button"
          className="training-exercise-card__row training-exercise-card__row--accent training-exercise-card__select-existing"
          onClick={() => setIsExercisePickerOpen(true)}
        >
          <span className="training-exercise-card__action-text">
            Выбрать существующее
          </span>
        </button>

        <div className="training-exercise-card__row training-exercise-card__row--comment">
          <textarea
            className="training-exercise-card__comment-input"
            placeholder="Введите комментарий к упражнению"
            value={exerciseComment}
            onChange={(event) => setExerciseComment(event.target.value)}
            rows={3}
          />
        </div>

        <div className="training-exercise-card__row training-exercise-card__row--accent training-exercise-card__row--history">
          <span>История упражнения</span>

          <svg
            className="training-exercise-card__history-icon"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M12 8V12L15 14"
              stroke="currentColor"
              strokeWidth="2.1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 3C7.03 3 3 7.03 3 12C3 16.97 7.03 21 12 21C16.97 21 21 16.97 21 12"
              stroke="currentColor"
              strokeWidth="2.1"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <section className="training-exercise-card__sets" aria-label="Подходы">
          <div className="training-exercise-card__set-headings">
            <span>Повторения</span>
            <span>Вес</span>
            <span>Сложность</span>
          </div>

          <div className="training-exercise-card__set-row">
            <span>10</span>
            <span>40 кг</span>
            <span>...</span>
          </div>
        </section>

        <div className="training-exercise-card__row training-exercise-card__row--accent training-exercise-card__row--params">
          <span className="training-exercise-card__action-text">
            Дополнительные параметры
          </span>

          <span
            className="training-exercise-card__params-chevron"
            aria-hidden="true"
          >
            ›
          </span>
        </div>

        <div className="training-exercise-card__row training-exercise-card__row--accent">
          <span className="training-exercise-card__action-text">
            Добавить подход
          </span>
        </div>

        <div className="training-exercise-card__row training-exercise-card__row--danger">
          <span className="training-exercise-card__action-text">
            Убрать упражнение
          </span>
        </div>
      </div>

      {isExercisePickerOpen && (
        <ExercisePickerOverlay
          onClose={() => setIsExercisePickerOpen(false)}
          onSelect={(exercise) => {
            setExerciseName(exercise.name);
            setIsExercisePickerOpen(false);
          }}
        />
      )}
    </article>
  );
}
