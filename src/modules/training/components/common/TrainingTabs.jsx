import "./TrainingTabs.css";

export default function TrainingTabs({
  activeTab,
  onHistoryClick,
  onTemplatesClick,
  onExercisesClick,
}) {
  return (
    <header className="training-tabs" aria-label="Разделы тренировок">
      <button
        type="button"
        className={`training-tabs__item ${
          activeTab === "history" ? "is-active" : ""
        }`}
        onClick={onHistoryClick}
      >
        История
      </button>

      <button
        type="button"
        className={`training-tabs__item ${
          activeTab === "templates" ? "is-active" : ""
        }`}
        onClick={onTemplatesClick}
      >
        Шаблоны
      </button>

      <button
        type="button"
        className={`training-tabs__item ${
          activeTab === "exercises" ? "is-active" : ""
        }`}
        onClick={onExercisesClick}
      >
        Упражнения
      </button>
    </header>
  );
}
