import { useRef, useState } from "react";

import { Settings } from "lucide-react";
import DifficultyPopover from "../popovers/DifficultyPopover";

import ExercisePickerOverlay from "../exercises/ExercisePickerOverlay";
import "./TrainingExerciseCard.css";

export default function TrainingExerciseCard() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isExercisePickerOpen, setIsExercisePickerOpen] = useState(false);
  const [exerciseName, setExerciseName] = useState("");
  const [exerciseComment, setExerciseComment] = useState("");
  const [sets, setSets] = useState([]);
  const difficultyButtonRefs = useRef({});
  const [openDifficultySetId, setOpenDifficultySetId] = useState(null);

  const handleToggle = () => {
    setIsCollapsed((prev) => !prev);
  };

  const handleAddSet = () => {
    setSets((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        weight: 0,
        repetitions: 0,
        difficulty: null,
        rir: 0,
        rpe: 0,
        rest: 0,
        time: 0,
        isExtraOpen: false,
      },
    ]);
  };

  const updateSet = (setId, field, value) => {
    setSets((prev) =>
      prev.map((set) =>
        set.id === setId
          ? {
              ...set,
              [field]: value,
            }
          : set,
      ),
    );
  };

  const toggleSetExtra = (setId) => {
    setSets((prev) =>
      prev.map((set) =>
        set.id === setId
          ? {
              ...set,
              isExtraOpen: !set.isExtraOpen,
            }
          : set,
      ),
    );
  };

  const setDifficulty = (setId, difficulty) => {
    setSets((prev) =>
      prev.map((set) =>
        set.id === setId
          ? {
              ...set,
              difficulty,
            }
          : set,
      ),
    );
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
        <div className="training-exercise-card__body-inner">
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

          {sets.map((set, index) => (
            <section
              key={set.id}
              className={`training-exercise-card__set${
                set.isExtraOpen
                  ? " training-exercise-card__set--extra-open"
                  : ""
              }`}
              aria-label={`Подход ${index + 1}`}
            >
              <div className="training-exercise-card__set-title">
                Подход {index + 1}
              </div>

              <div className="training-exercise-card__set-values">
                <div className="training-exercise-card__set-value">
                  <span>Вес</span>

                  <input
                    type="text"
                    className="training-exercise-card__set-input"
                    inputMode="decimal"
                    value={set.weight === 0 ? "" : set.weight}
                    placeholder="x"
                    onChange={(event) =>
                      updateSet(set.id, "weight", event.target.value)
                    }
                    aria-label={`Вес, подход ${index + 1}`}
                  />
                </div>

                <div className="training-exercise-card__set-value">
                  <span>Повторения</span>

                  <input
                    type="text"
                    className="training-exercise-card__set-input"
                    inputMode="decimal"
                    value={set.repetitions === 0 ? "" : set.repetitions}
                    placeholder="x"
                    onChange={(event) =>
                      updateSet(set.id, "repetitions", event.target.value)
                    }
                    aria-label={`Повторения, подход ${index + 1}`}
                  />
                </div>

                <div className="training-exercise-card__set-value training-exercise-card__set-value--difficulty">
                  <span>Сложность</span>

                  <div className="training-exercise-card__difficulty-wrap">
                    <button
                      ref={(element) => {
                        if (element) {
                          difficultyButtonRefs.current[set.id] = element;
                        }
                      }}
                      type="button"
                      className={`training-exercise-card__difficulty-dot${
                        set.difficulty
                          ? ` training-exercise-card__difficulty-dot--${set.difficulty}`
                          : ""
                      }`}
                      aria-label="Выбрать сложность"
                      aria-expanded={openDifficultySetId === set.id}
                      onClick={() => {
                        setOpenDifficultySetId((currentId) =>
                          currentId === set.id ? null : set.id,
                        );
                      }}
                    />
                  </div>
                </div>
              </div>

              <div
                className={`training-exercise-card__set-extra${
                  set.isExtraOpen
                    ? " training-exercise-card__set-extra--open"
                    : ""
                }`}
              >
                <div className="training-exercise-card__set-extra-grid">
                  <div className="training-exercise-card__extra-field">
                    <span>RIR</span>

                    <input
                      type="number"
                      min="0"
                      value={set.rir}
                      onChange={(event) =>
                        updateSet(set.id, "rir", event.target.value)
                      }
                    />
                  </div>

                  <div className="training-exercise-card__extra-field">
                    <span>RPE</span>

                    <input
                      type="number"
                      min="0"
                      value={set.rpe}
                      onChange={(event) =>
                        updateSet(set.id, "rpe", event.target.value)
                      }
                    />
                  </div>

                  <div className="training-exercise-card__extra-field">
                    <span>Отдых, сек.</span>

                    <input
                      type="number"
                      min="0"
                      value={set.rest}
                      onChange={(event) =>
                        updateSet(set.id, "rest", event.target.value)
                      }
                    />
                  </div>

                  <div className="training-exercise-card__extra-field">
                    <span>Время, сек.</span>

                    <input
                      type="number"
                      min="0"
                      value={set.time}
                      onChange={(event) =>
                        updateSet(set.id, "time", event.target.value)
                      }
                    />
                  </div>
                </div>
              </div>

              <button
                type="button"
                className={`training-exercise-card__set-settings${
                  set.isExtraOpen
                    ? " training-exercise-card__set-settings--open"
                    : ""
                }`}
                onClick={() => toggleSetExtra(set.id)}
                aria-label={
                  set.isExtraOpen
                    ? "Скрыть дополнительные параметры"
                    : "Показать дополнительные параметры"
                }
                aria-expanded={set.isExtraOpen}
              >
                <Settings
                  className="training-exercise-card__set-settings-icon"
                  size={18}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
              </button>
            </section>
          ))}

          {openDifficultySetId && (
            <DifficultyPopover
              anchorRef={{
                current: difficultyButtonRefs.current[openDifficultySetId],
              }}
              value={
                sets.find((set) => set.id === openDifficultySetId)
                  ?.difficulty || null
              }
              onChange={(difficulty) => {
                setDifficulty(openDifficultySetId, difficulty);
              }}
              onClose={() => {
                setOpenDifficultySetId(null);
              }}
            />
          )}

          <button
            type="button"
            className="training-exercise-card__row training-exercise-card__row--accent training-exercise-card__add-set"
            onClick={handleAddSet}
          >
            <span className="training-exercise-card__action-text">
              Добавить подход
            </span>
          </button>

          <div className="training-exercise-card__row training-exercise-card__row--danger">
            <span className="training-exercise-card__action-text">
              Убрать упражнение
            </span>
          </div>
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
