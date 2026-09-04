import { useEffect, useRef, useState } from "react";
import { Image, MessageSquare, Settings, Video } from "lucide-react";
import DifficultyPopover from "../popovers/DifficultyPopover";
import ParametersPopover from "../popovers/ParametersPopover";
import ConfirmDeletePopover from "../popovers/ConfirmDeletePopover";

import ExercisePickerOverlay from "../exercises/ExercisePickerOverlay";
import "./TrainingExerciseCard.css";

const intensityMethods = [
  {
    id: "drop-set",
    label: "Drop-set",
  },
  {
    id: "isometrics",
    label: "Изометрия",
  },
  {
    id: "cluster",
    label: "Cluster",
  },
  {
    id: "rest-pause",
    label: "Rest-pause",
  },
  {
    id: "tempo-superset",
    label: "Темповый суперсет",
  },
  {
    id: "partial-reps",
    label: "Частичные повторения",
  },
];

export default function TrainingExerciseCard({
  exerciseId,
  exerciseNumber = 1,
  isSupersetActionSelected = false,
  isSupersetMember = false,
  onToggleSuperset,
  onRemoveExercise,
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isExercisePickerOpen, setIsExercisePickerOpen] = useState(false);
  const [exerciseName, setExerciseName] = useState("");
  const [exerciseComment, setExerciseComment] = useState("");
  const [sets, setSets] = useState([]);
  const [swipedSetId, setSwipedSetId] = useState(null);
  const [swipedSetSide, setSwipedSetSide] = useState(null);

  const swipeTouchRef = useRef({
    setId: null,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    directionLocked: false,
    isHorizontal: false,
  });
  const difficultyButtonRefs = useRef({});
  const [openDifficultySetId, setOpenDifficultySetId] = useState(null);

  const [isParametersPopoverOpen, setIsParametersPopoverOpen] = useState(false);
  const [isDeletePopoverOpen, setIsDeletePopoverOpen] = useState(false);

  const [selectedParameters, setSelectedParameters] = useState([
    "weight",
    "repetitions",
    "difficulty",
  ]);

  const parametersButtonRef = useRef(null);
  const deleteButtonRef = useRef(null);

  const exerciseNameInputRef = useRef(null);
  const exerciseCommentInputRef = useRef(null);

  useEffect(() => {
    const textarea = exerciseNameInputRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = "0px";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [exerciseName]);

  useEffect(() => {
    const textarea = exerciseCommentInputRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = "0px";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [exerciseComment]);

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
        intensityMethods: [],
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

  const toggleIntensityMethod = (setId, methodId) => {
    setSets((prev) =>
      prev.map((set) => {
        if (set.id !== setId) {
          return set;
        }

        const isSelected = set.intensityMethods.includes(methodId);

        return {
          ...set,
          intensityMethods: isSelected
            ? set.intensityMethods.filter(
                (selectedMethodId) => selectedMethodId !== methodId,
              )
            : [...set.intensityMethods, methodId],
        };
      }),
    );
  };

  const handleSetTouchStart = (setId, event) => {
    const touch = event.touches[0];

    swipeTouchRef.current = {
      setId,
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
      directionLocked: false,
      isHorizontal: false,
    };
  };

  const handleSetTouchMove = (setId, event) => {
    const swipe = swipeTouchRef.current;

    if (swipe.setId !== setId) {
      return;
    }

    const touch = event.touches[0];

    const deltaX = touch.clientX - swipe.startX;
    const deltaY = touch.clientY - swipe.startY;

    if (!swipe.directionLocked) {
      if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
        return;
      }

      const horizontalDistance = Math.abs(deltaX);
      const verticalDistance = Math.abs(deltaY);

      const isHorizontal =
        horizontalDistance >= 24 &&
        horizontalDistance > verticalDistance * 1.35;

      const isVertical =
        verticalDistance >= 24 && verticalDistance > horizontalDistance * 1.35;

      if (!isHorizontal && !isVertical) {
        return;
      }

      swipeTouchRef.current = {
        ...swipe,
        directionLocked: true,
        currentX: touch.clientX,
        currentY: touch.clientY,
        isHorizontal,
      };

      if (isHorizontal) {
        event.preventDefault();
      }

      return;
    }

    if (swipe.isHorizontal) {
      event.preventDefault();

      swipeTouchRef.current.currentX = touch.clientX;
      swipeTouchRef.current.currentY = touch.clientY;

      return;
    }

    swipeTouchRef.current.currentX = touch.clientX;
    swipeTouchRef.current.currentY = touch.clientY;
  };

  const handleSetTouchEnd = (setId) => {
    const swipe = swipeTouchRef.current;

    if (swipe.setId !== setId) {
      return;
    }

    const deltaX = swipe.currentX - swipe.startX;
    const deltaY = swipe.currentY - swipe.startY;

    if (
      swipe.directionLocked &&
      Math.abs(deltaX) >= 45 &&
      Math.abs(deltaX) > Math.abs(deltaY)
    ) {
      const currentSide = swipedSetId === setId ? swipedSetSide : null;

      if (deltaX < 0) {
        // Свайп влево
        if (currentSide === "left") {
          // Из левого состояния возвращаемся в центр
          setSwipedSetId(null);
          setSwipedSetSide(null);
        } else if (currentSide === null) {
          // Из центра открываем правое меню
          setSwipedSetId(setId);
          setSwipedSetSide("right");
        }
      } else {
        // Свайп вправо
        if (currentSide === "right") {
          // Из правого состояния возвращаемся в центр
          setSwipedSetId(null);
          setSwipedSetSide(null);
        } else if (currentSide === null) {
          // Из центра открываем левое меню
          setSwipedSetId(setId);
          setSwipedSetSide("left");
        }
      }
    }

    swipeTouchRef.current = {
      setId: null,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      directionLocked: false,
      isHorizontal: false,
    };
  };

  const handleSetTouchCancel = () => {
    swipeTouchRef.current = {
      setId: null,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      directionLocked: false,
      isHorizontal: false,
    };
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
    <article
      className={`training-exercise-card${
        isSupersetActionSelected
          ? " training-exercise-card--superset-active"
          : ""
      }${isSupersetMember ? " training-exercise-card--superset-member" : ""}`}
    >
      <div className="training-exercise-card__number" aria-hidden="true">
        {exerciseNumber}
      </div>

      <div className="training-exercise-card__exercise-content">
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
                ref={exerciseCommentInputRef}
                className="training-exercise-card__comment-input"
                placeholder="Введите комментарий к упражнению"
                value={exerciseComment}
                onChange={(event) => setExerciseComment(event.target.value)}
                rows={1}
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
                }${
                  swipedSetId === set.id && swipedSetSide === "left"
                    ? " training-exercise-card__set--swiped-left"
                    : ""
                }${
                  swipedSetId === set.id && swipedSetSide === "right"
                    ? " training-exercise-card__set--swiped-right"
                    : ""
                }`}
                aria-label={`Подход ${index + 1}`}
                onTouchStart={(event) => handleSetTouchStart(set.id, event)}
                onTouchMove={(event) => handleSetTouchMove(set.id, event)}
                onTouchEnd={() => handleSetTouchEnd(set.id)}
                onTouchCancel={handleSetTouchCancel}
              >
                <div
                  className="training-exercise-card__set-actions training-exercise-card__set-actions--left"
                  aria-hidden={
                    swipedSetId !== set.id || swipedSetSide !== "left"
                  }
                >
                  <button
                    type="button"
                    className="training-exercise-card__set-action"
                    aria-label="Скопировать подход"
                    onClick={() => {
                      setSwipedSetId(null);
                      setSwipedSetSide(null);
                    }}
                  >
                    Скопировать
                  </button>

                  <button
                    type="button"
                    className="training-exercise-card__set-action training-exercise-card__set-action--delete"
                    aria-label="Удалить подход"
                    onClick={() => {
                      setSwipedSetId(null);
                      setSwipedSetSide(null);
                    }}
                  >
                    Удалить
                  </button>
                </div>
                <div
                  className={`training-exercise-card__set-content${
                    swipedSetId === set.id
                      ? " training-exercise-card__set-content--swiped"
                      : ""
                  }`}
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
                                    difficultyButtonRefs.current[set.id] =
                                      element;
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

                  {set.intensityMethods.length > 0 && (
                    <div className="training-exercise-card__selected-intensity-methods">
                      {set.intensityMethods.map((methodId) => {
                        const method = intensityMethods.find(
                          (item) => item.id === methodId,
                        );

                        if (!method) {
                          return null;
                        }

                        return (
                          <div
                            key={method.id}
                            className="training-exercise-card__selected-intensity-method"
                          >
                            {method.label}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div
                    className={`training-exercise-card__set-extra${
                      set.isExtraOpen
                        ? " training-exercise-card__set-extra--open"
                        : ""
                    }`}
                  >
                    <div className="training-exercise-card__set-extra-content">
                      <div className="training-exercise-card__intensity-divider">
                        <span />
                      </div>

                      <div className="training-exercise-card__intensity-methods">
                        {intensityMethods.map((method) => {
                          const isSelected = set.intensityMethods.includes(
                            method.id,
                          );

                          return (
                            <button
                              key={method.id}
                              type="button"
                              className={`training-exercise-card__intensity-method${
                                isSelected
                                  ? " training-exercise-card__intensity-method--selected"
                                  : ""
                              }`}
                              onClick={() =>
                                toggleIntensityMethod(set.id, method.id)
                              }
                              aria-pressed={isSelected}
                            >
                              {method.label}
                            </button>
                          );
                        })}
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
                </div>
                <div
                  className="training-exercise-card__set-actions"
                  aria-hidden={
                    swipedSetId !== set.id || swipedSetSide !== "right"
                  }
                >
                  <button
                    type="button"
                    className="training-exercise-card__set-action"
                    aria-label="Добавить фото"
                    onClick={() => {
                      setSwipedSetId(null);
                      setSwipedSetSide(null);
                    }}
                  >
                    <Image size={20} strokeWidth={1.8} />
                  </button>

                  <button
                    type="button"
                    className="training-exercise-card__set-action"
                    aria-label="Добавить видео"
                    onClick={() => {
                      setSwipedSetId(null);
                      setSwipedSetSide(null);
                    }}
                  >
                    <Video size={20} strokeWidth={1.8} />
                  </button>

                  <button
                    type="button"
                    className="training-exercise-card__set-action"
                    aria-label="Добавить комментарий"
                    onClick={() => {
                      setSwipedSetId(null);
                      setSwipedSetSide(null);
                    }}
                  >
                    <MessageSquare size={20} strokeWidth={1.8} />
                  </button>
                </div>
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
                isSupersetSelected={isSupersetActionSelected}
                onSupersetToggle={() => {
                  onToggleSuperset?.(exerciseId);
                }}
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

            <div className="training-exercise-card__delete-wrapper">
              <button
                ref={deleteButtonRef}
                type="button"
                className="training-exercise-card__row training-exercise-card__row--danger"
                onClick={() => {
                  setIsDeletePopoverOpen(true);
                }}
              >
                <span className="training-exercise-card__action-text">
                  Удалить упражнение
                </span>
              </button>

              <ConfirmDeletePopover
                anchorRef={deleteButtonRef}
                open={isDeletePopoverOpen}
                onConfirm={() => {
                  onRemoveExercise?.(exerciseId);
                  setIsDeletePopoverOpen(false);
                }}
                onCancel={() => {
                  setIsDeletePopoverOpen(false);
                }}
              />
            </div>
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
