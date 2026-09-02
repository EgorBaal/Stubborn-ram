import { useEffect, useRef, useState } from "react";

import { Settings } from "lucide-react";
import DifficultyPopover from "../popovers/DifficultyPopover";
import ParametersPopover from "../popovers/ParametersPopover";

import ExercisePickerOverlay from "../exercises/ExercisePickerOverlay";
import "./TrainingExerciseCard.css";

export default function TrainingExerciseCard({ exerciseNumber = 1 }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isExercisePickerOpen, setIsExercisePickerOpen] = useState(false);
  const [exerciseName, setExerciseName] = useState("");
  const [exerciseComment, setExerciseComment] = useState("");
  const [sets, setSets] = useState([]);
  const difficultyButtonRefs = useRef({});
  const [openDifficultySetId, setOpenDifficultySetId] = useState(null);

  const [isParametersPopoverOpen, setIsParametersPopoverOpen] = useState(false);

  const [selectedParameters, setSelectedParameters] = useState([
    "weight",
    "repetitions",
    "difficulty",
  ]);

  const parametersButtonRef = useRef(null);

  const exerciseNameInputRef = useRef(null);

  useEffect(() => {
    const textarea = exerciseNameInputRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = "0px";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [exerciseName]);

  const handleToggle = () => {
    setIsCollapsed((prev) => !prev);
  };

  const handleAddSet = () => {
    setSets((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        weight: "",
        repetitions: "",
        difficulty: null,
        distance: "",
        calories: "",
        speed: "",
        power: "",
        incline: "",
        time: "",
        rir: "",
        rpe: "",
        rest: 0,
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
      <div className="training-exercise-card__number" aria-hidden="true">
        {exerciseNumber}
      </div>

      <div className="training-exercise-card__row training-exercise-card__row--title">
        <textarea
          ref={exerciseNameInputRef}
          className="training-exercise-card__name-input"
          placeholder="Название упражнения"
          value={exerciseName}
          onChange={(event) => setExerciseName(event.target.value)}
          rows={1}
        ></textarea>

        {!isCollapsed && (
          <button
            type="button"
            className="training-exercise-card__select"
            onClick={() => setIsExercisePickerOpen(true)}
            aria-label="Выбрать упражнение"
          >
            +
          </button>
        )}

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
          <div className="training-exercise-card__row training-exercise-card__row--comment">
            <textarea
              className="training-exercise-card__comment-input"
              placeholder="Введите комментарий к упражнению"
              value={exerciseComment}
              onChange={(event) => setExerciseComment(event.target.value)}
              rows={3}
            />
          </div>

          <div className="training-exercise-card__row training-exercise-card__row--tools">
            <button
              type="button"
              className="training-exercise-card__tool training-exercise-card__tool--history"
            >
              <span>История</span>

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
            </button>

            <span
              className="training-exercise-card__tools-divider"
              aria-hidden="true"
            />

            <button
              ref={parametersButtonRef}
              type="button"
              className="training-exercise-card__tool training-exercise-card__tool--parameters"
              onClick={() => {
                setIsParametersPopoverOpen((isOpen) => !isOpen);
              }}
              aria-label="Открыть параметры упражнения"
              aria-expanded={isParametersPopoverOpen}
            >
              <span>Параметры</span>
            </button>
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
                {selectedParameters.map((parameterId) => {
                  if (parameterId === "difficulty") {
                    return (
                      <div
                        key={parameterId}
                        className="training-exercise-card__set-value training-exercise-card__set-value--difficulty"
                      >
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
                            aria-label={`Выбрать сложность, подход ${index + 1}`}
                            aria-expanded={openDifficultySetId === set.id}
                            onClick={() => {
                              setOpenDifficultySetId((currentId) =>
                                currentId === set.id ? null : set.id,
                              );
                            }}
                          />
                        </div>
                      </div>
                    );
                  }

                  const parameterLabels = {
                    weight: "Вес",
                    repetitions: "Повторения",
                    distance: "Расстояние",
                    calories: "Калории",
                    speed: "Скорость",
                    power: "Мощность",
                    incline: "Наклон",
                    time: "Время",
                    rir: "RIR",
                    rpe: "RPE",
                  };

                  return (
                    <div
                      key={parameterId}
                      className="training-exercise-card__set-value"
                    >
                      <span>{parameterLabels[parameterId]}</span>

                      <input
                        type="text"
                        className="training-exercise-card__set-input"
                        inputMode="decimal"
                        value={set[parameterId] ?? ""}
                        placeholder="x"
                        onChange={(event) =>
                          updateSet(set.id, parameterId, event.target.value)
                        }
                        aria-label={`${parameterLabels[parameterId]}, подход ${index + 1}`}
                      />
                    </div>
                  );
                })}
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

          {isParametersPopoverOpen && (
            <ParametersPopover
              anchorRef={parametersButtonRef}
              selectedParameters={selectedParameters}
              onChange={setSelectedParameters}
              onClose={() => {
                setIsParametersPopoverOpen(false);
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
