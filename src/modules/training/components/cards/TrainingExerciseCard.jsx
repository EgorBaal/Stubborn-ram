import { useEffect, useRef, useState } from "react";
import { Image, MessageSquare, Settings, Video } from "lucide-react";
import DifficultyPopover from "../popovers/DifficultyPopover";
import ParametersPopover from "../popovers/ParametersPopover";
import ConfirmDeletePopover from "../popovers/ConfirmDeletePopover";

import ExercisePickerOverlay from "../exercises/ExercisePickerOverlay";
import "./TrainingExerciseCard.css";
import { getSetMaterials } from "../../services/trainingMaterialsService";

const MIN_PHOTO_ZOOM = 1;
const MAX_PHOTO_ZOOM = 4;
const PHOTO_ZOOM_STEP = 0.25;
const PHOTO_SWIPE_THRESHOLD = 50;
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
  initialExerciseId = null,
  initialExerciseName = "",
  initialExerciseComment = "",
  initialSets = [],
  isSupersetActionSelected = false,
  isSupersetMember = false,
  onToggleSuperset,
  onRemoveExercise,
  onChange,
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isExercisePickerOpen, setIsExercisePickerOpen] = useState(false);
  const [exerciseName, setExerciseName] = useState("");
  const [selectedExerciseId, setSelectedExerciseId] = useState(null);
  const [exerciseComment, setExerciseComment] = useState("");
  const [sets, setSets] = useState([]);
  const [setMaterials, setSetMaterials] = useState({});
  const [feedbackSetId, setFeedbackSetId] = useState(null);
  const [materialsModalSetId, setMaterialsModalSetId] = useState(null);
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
  const photoInputRef = useRef(null);
  const [photoFiles, setPhotoFiles] = useState([]);
  const photoViewerRef = useRef(null);

  const photoTouchState = useRef({
    startX: 0,
    startY: 0,
    startTime: 0,
    pinchDistance: null,
    pinchZoom: MIN_PHOTO_ZOOM,
    pinchCenter: null,
  });

  const photoPointerState = useRef(null);

  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);
  const [photoZoom, setPhotoZoom] = useState(MIN_PHOTO_ZOOM);
  const [photoPosition, setPhotoPosition] = useState({
    x: 0,
    y: 0,
  });

  const exerciseNameInputRef = useRef(null);
  const exerciseCommentInputRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const hasHydratedInitialDataRef = useRef(false);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

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

  useEffect(() => {
    onChangeRef.current?.({
      exerciseId: selectedExerciseId,
      exerciseName,
      exerciseComment,
      sets,
    });
  }, [selectedExerciseId, exerciseName, exerciseComment, sets]);

  useEffect(() => {
    if (hasHydratedInitialDataRef.current) {
      return;
    }

    const hasInitialData =
      initialExerciseId ||
      initialExerciseName ||
      initialExerciseComment ||
      initialSets.length > 0;

    if (!hasInitialData) {
      return;
    }

    hasHydratedInitialDataRef.current = true;

    setSelectedExerciseId(initialExerciseId);
    setExerciseName(initialExerciseName);
    setExerciseComment(initialExerciseComment);
    setSets(
      initialSets.map((set) => ({
        ...set,
        intensityMethods: Array.isArray(set.intensityMethods)
          ? [...set.intensityMethods]
          : [],
      })),
    );
  }, [
    initialExerciseId,
    initialExerciseName,
    initialExerciseComment,
    initialSets,
  ]);

  useEffect(() => {
    const loadSetMaterials = async () => {
      const persistedSets = initialSets.filter((set) => set.id);

      if (persistedSets.length === 0) {
        return;
      }

      await Promise.all(
        persistedSets.map(async (set) => {
          const result = await getSetMaterials(set.id);

          if (result.error) {
            console.error(
              `Ошибка загрузки материалов подхода ${set.id}:`,
              result.error,
            );
            return;
          }

          setSetMaterials((prev) => ({
            ...prev,
            [set.id]: result.data?.materials ?? [],
          }));
        }),
      );
    };

    loadSetMaterials();
  }, [initialSets]);

  const resetPhotoViewerTransform = () => {
    setPhotoZoom(MIN_PHOTO_ZOOM);
    setPhotoPosition({
      x: 0,
      y: 0,
    });
  };

  const handleOpenPhotoViewer = (index) => {
    setSelectedPhotoIndex(index);
    resetPhotoViewerTransform();
  };

  const handleClosePhotoViewer = () => {
    setSelectedPhotoIndex(null);
    resetPhotoViewerTransform();
  };

  const handlePreviousPhoto = () => {
    setSelectedPhotoIndex((current) => {
      if (current === null || current <= 0) {
        return current;
      }

      resetPhotoViewerTransform();
      return current - 1;
    });
  };

  const handleNextPhoto = () => {
    setSelectedPhotoIndex((current) => {
      if (current === null || current >= photoFiles.length - 1) {
        return current;
      }

      resetPhotoViewerTransform();
      return current + 1;
    });
  };

  const getPhotoTouchDistance = (touches) => {
    if (touches.length < 2) {
      return 0;
    }

    const first = touches[0];
    const second = touches[1];

    return Math.hypot(
      second.clientX - first.clientX,
      second.clientY - first.clientY,
    );
  };

  const getPhotoTouchCenter = (touches) => ({
    x: (touches[0].clientX + touches[1].clientX) / 2,
    y: (touches[0].clientY + touches[1].clientY) / 2,
  });

  const getPhotoViewerCenter = () => {
    const rect = photoViewerRef.current?.getBoundingClientRect();

    if (!rect) {
      return {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      };
    }

    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  };

  const zoomPhotoAroundPoint = (nextZoom, clientX, clientY) => {
    const clampedZoom = Math.min(
      MAX_PHOTO_ZOOM,
      Math.max(MIN_PHOTO_ZOOM, nextZoom),
    );

    if (clampedZoom === MIN_PHOTO_ZOOM) {
      resetPhotoViewerTransform();
      return;
    }

    setPhotoPosition((current) => {
      const viewerCenter = getPhotoViewerCenter();

      const pointX = clientX - viewerCenter.x;
      const pointY = clientY - viewerCenter.y;

      const oldScale = photoZoom;
      const scaleRatio = clampedZoom / oldScale;

      return {
        x: pointX - (pointX - current.x) * scaleRatio,
        y: pointY - (pointY - current.y) * scaleRatio,
      };
    });

    setPhotoZoom(clampedZoom);
  };

  const handlePhotoTouchStart = (event) => {
    if (event.touches.length >= 2) {
      event.preventDefault();

      const distance = getPhotoTouchDistance(event.touches);
      const center = getPhotoTouchCenter(event.touches);

      photoTouchState.current.pinchDistance = distance;
      photoTouchState.current.pinchZoom = photoZoom;
      photoTouchState.current.pinchCenter = center;

      return;
    }

    const touch = event.touches[0];

    if (!touch) {
      return;
    }

    photoTouchState.current.startX = touch.clientX;
    photoTouchState.current.startY = touch.clientY;
    photoTouchState.current.startTime = Date.now();
  };

  const handlePhotoTouchMove = (event) => {
    if (event.touches.length >= 2) {
      event.preventDefault();

      const distance = getPhotoTouchDistance(event.touches);
      const center = getPhotoTouchCenter(event.touches);

      if (!photoTouchState.current.pinchDistance || !distance) {
        return;
      }

      const scale = distance / photoTouchState.current.pinchDistance;

      const nextZoom = Math.min(
        MAX_PHOTO_ZOOM,
        Math.max(MIN_PHOTO_ZOOM, photoTouchState.current.pinchZoom * scale),
      );

      const previousCenter = photoTouchState.current.pinchCenter;

      const viewerCenter = getPhotoViewerCenter();

      const centerDeltaX = center.x - previousCenter.x;
      const centerDeltaY = center.y - previousCenter.y;

      setPhotoPosition((current) => {
        const pointX = previousCenter.x - viewerCenter.x;
        const pointY = previousCenter.y - viewerCenter.y;

        const scaleRatio = nextZoom / photoTouchState.current.pinchZoom;

        return {
          x: pointX - (pointX - current.x) * scaleRatio + centerDeltaX,
          y: pointY - (pointY - current.y) * scaleRatio + centerDeltaY,
        };
      });

      setPhotoZoom(nextZoom);

      photoTouchState.current.pinchCenter = center;

      return;
    }

    if (photoZoom > MIN_PHOTO_ZOOM) {
      event.preventDefault();

      const touch = event.touches[0];

      const deltaX = touch.clientX - photoTouchState.current.startX;
      const deltaY = touch.clientY - photoTouchState.current.startY;

      setPhotoPosition((current) => ({
        x: current.x + deltaX,
        y: current.y + deltaY,
      }));

      photoTouchState.current.startX = touch.clientX;
      photoTouchState.current.startY = touch.clientY;
    }
  };

  const handlePhotoTouchEnd = (event) => {
    if (photoTouchState.current.pinchDistance !== null) {
      if (event.touches.length < 2) {
        photoTouchState.current.pinchDistance = null;
        photoTouchState.current.pinchCenter = null;
      }

      return;
    }

    if (photoZoom > MIN_PHOTO_ZOOM) {
      return;
    }

    const touch = event.changedTouches[0];

    if (!touch) {
      return;
    }

    const deltaX = touch.clientX - photoTouchState.current.startX;
    const deltaY = touch.clientY - photoTouchState.current.startY;

    const elapsed = Date.now() - photoTouchState.current.startTime;

    if (
      Math.abs(deltaX) >= PHOTO_SWIPE_THRESHOLD &&
      Math.abs(deltaX) > Math.abs(deltaY) &&
      elapsed < 700
    ) {
      if (deltaX < 0) {
        handleNextPhoto();
      } else {
        handlePreviousPhoto();
      }
    }
  };

  const handlePhotoPointerDown = (event) => {
    if (photoZoom <= MIN_PHOTO_ZOOM || event.pointerType === "touch") {
      return;
    }

    photoPointerState.current = {
      x: event.clientX,
      y: event.clientY,
    };

    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handlePhotoPointerMove = (event) => {
    if (!photoPointerState.current || photoZoom <= MIN_PHOTO_ZOOM) {
      return;
    }

    const deltaX = event.clientX - photoPointerState.current.x;
    const deltaY = event.clientY - photoPointerState.current.y;

    setPhotoPosition((current) => ({
      x: current.x + deltaX,
      y: current.y + deltaY,
    }));

    photoPointerState.current = {
      x: event.clientX,
      y: event.clientY,
    };
  };

  const handlePhotoPointerUp = () => {
    photoPointerState.current = null;
  };

  const handlePhotoWheel = (event) => {
    event.preventDefault();

    const direction = event.deltaY < 0 ? 1 : -1;

    zoomPhotoAroundPoint(
      photoZoom + direction * PHOTO_ZOOM_STEP,
      event.clientX,
      event.clientY,
    );
  };

  const handlePhotoViewerKeyDown = (event) => {
    if (event.key === "Escape") {
      handleClosePhotoViewer();
      return;
    }

    if (photoZoom !== MIN_PHOTO_ZOOM) {
      return;
    }

    if (event.key === "ArrowLeft") {
      handlePreviousPhoto();
    }

    if (event.key === "ArrowRight") {
      handleNextPhoto();
    }
  };

  useEffect(() => {
    if (selectedPhotoIndex === null) {
      return;
    }

    photoViewerRef.current?.focus();
  }, [selectedPhotoIndex]);

  const selectedPhoto =
    selectedPhotoIndex !== null ? photoFiles[selectedPhotoIndex] : null;
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

  const handleCopySet = (setId) => {
    setSets((prev) => {
      const sourceIndex = prev.findIndex((set) => set.id === setId);

      if (sourceIndex === -1) {
        return prev;
      }

      const sourceSet = prev[sourceIndex];

      const copiedSet = {
        ...sourceSet,
        id: crypto.randomUUID(),
        intensityMethods: [...sourceSet.intensityMethods],
        isExtraOpen: false,
      };

      const nextSets = [...prev];

      nextSets.splice(sourceIndex + 1, 0, copiedSet);

      return nextSets;
    });

    setSwipedSetId(null);
    setSwipedSetSide(null);
  };

  const handleDeleteSet = (setId) => {
    setSets((prev) => prev.filter((set) => set.id !== setId));

    setSwipedSetId(null);
    setSwipedSetSide(null);
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

    if (!touch) {
      return;
    }

    const deltaX = touch.clientX - swipe.startX;
    const deltaY = touch.clientY - swipe.startY;

    if (swipe.directionLocked) {
      swipeTouchRef.current.currentX = touch.clientX;
      swipeTouchRef.current.currentY = touch.clientY;

      return;
    }

    const horizontalDistance = Math.abs(deltaX);
    const verticalDistance = Math.abs(deltaY);

    if (horizontalDistance < 24 && verticalDistance < 24) {
      return;
    }

    const isHorizontal =
      horizontalDistance >= 24 && horizontalDistance >= verticalDistance * 1.5;

    const isVertical =
      verticalDistance >= 24 && verticalDistance >= horizontalDistance * 1.5;

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
                    onClick={() => handleCopySet(set.id)}
                  >
                    Скопировать
                  </button>

                  <button
                    type="button"
                    className="training-exercise-card__set-action training-exercise-card__set-action--delete"
                    aria-label="Удалить подход"
                    onClick={() => handleDeleteSet(set.id)}
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
                    <span>Подход {index + 1}</span>

                    {(() => {
                      const materials = setMaterials[set.id] ?? [];

                      const clientMaterials = materials.filter(
                        (material) => material.type === "CLIENT_NOTE",
                      );

                      const trainerMaterials = materials.filter(
                        (material) => material.type === "TRAINER_FEEDBACK",
                      );

                      const clientMedia = clientMaterials.flatMap(
                        (material) => material.media ?? [],
                      );

                      const hasPhoto = clientMedia.some((media) =>
                        media.mimeType?.startsWith("image/"),
                      );

                      const hasVideo = clientMedia.some((media) =>
                        media.mimeType?.startsWith("video/"),
                      );

                      const hasComment = clientMaterials.some((material) =>
                        material.comment?.trim(),
                      );

                      const hasTrainerFeedback = trainerMaterials.length > 0;

                      return (
                        <span className="training-exercise-card__set-indicators">
                          {hasPhoto && (
                            <Image size={14} aria-label="Есть фото" />
                          )}

                          {hasVideo && (
                            <Video size={14} aria-label="Есть видео" />
                          )}

                          {hasComment && (
                            <MessageSquare
                              size={14}
                              aria-label="Есть комментарий"
                            />
                          )}

                          {hasTrainerFeedback && (
                            <MessageSquare
                              size={14}
                              className="training-exercise-card__set-indicator--feedback"
                              aria-label="Есть обратная связь тренера"
                            />
                          )}
                        </span>
                      );
                    })()}
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
                    aria-label="Материалы подхода"
                    onClick={() => {
                      setMaterialsModalSetId(set.id);
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
            setSelectedExerciseId(exercise.id);
            setExerciseName(exercise.name);
            setIsExercisePickerOpen(false);
          }}
        />
      )}
      {materialsModalSetId && (
        <div
          className="training-exercise-card__materials-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Материалы подхода"
          onClick={() => setMaterialsModalSetId(null)}
        >
          <div
            className="training-exercise-card__materials-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="training-exercise-card__materials-header">
              <button
                type="button"
                className="training-exercise-card__materials-edit"
                onClick={() => {
                  setFeedbackSetId((currentId) =>
                    currentId === materialsModalSetId
                      ? null
                      : materialsModalSetId,
                  );
                }}
              >
                {feedbackSetId === materialsModalSetId
                  ? "Сохранить"
                  : "Изменить"}
              </button>

              <button
                type="button"
                className="training-exercise-card__materials-close"
                onClick={() => setMaterialsModalSetId(null)}
                aria-label="Закрыть"
              >
                ×
              </button>
            </div>

            <div className="training-exercise-card__materials-body">
              <div className="training-exercise-card__materials-item">
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  hidden
                  onChange={(event) => {
                    const files = Array.from(event.target.files ?? []);

                    if (files.length === 0) {
                      return;
                    }

                    setPhotoFiles((prev) => [
                      ...prev,
                      ...files.map((file) => ({
                        file,
                        previewUrl: URL.createObjectURL(file),
                      })),
                    ]);

                    event.target.value = "";
                  }}
                />

                <div className="training-exercise-card__materials-placeholder">
                  {photoFiles.length > 0 ? (
                    <div className="training-exercise-card__materials-photo-grid">
                      {photoFiles.map((photo, index) => (
                        <div
                          key={`${photo.file.name}-${photo.file.lastModified}-${index}`}
                          className="training-exercise-card__materials-photo"
                        >
                          <button
                            type="button"
                            className="training-exercise-card__materials-photo-open"
                            onClick={() => handleOpenPhotoViewer(index)}
                            aria-label={`Открыть фото ${index + 1}`}
                          >
                            <img
                              src={photo.previewUrl}
                              alt={`Фото ${index + 1}`}
                            />
                          </button>

                          {feedbackSetId === materialsModalSetId && (
                            <button
                              type="button"
                              className="training-exercise-card__materials-photo-delete"
                              aria-label={`Удалить фото ${index + 1}`}
                              onClick={() => {
                                URL.revokeObjectURL(photo.previewUrl);

                                setPhotoFiles((prev) =>
                                  prev.filter(
                                    (_, photoIndex) => photoIndex !== index,
                                  ),
                                );
                              }}
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}

                      {feedbackSetId === materialsModalSetId && (
                        <button
                          type="button"
                          className="training-exercise-card__materials-photo-add"
                          onClick={() => photoInputRef.current?.click()}
                          aria-label="Добавить фото"
                        >
                          +
                        </button>
                      )}
                    </div>
                  ) : (
                    <>
                      <Image size={28} strokeWidth={1.6} />

                      {feedbackSetId === materialsModalSetId && (
                        <button
                          type="button"
                          className="training-exercise-card__materials-plus"
                          onClick={() => photoInputRef.current?.click()}
                          aria-label="Добавить фото"
                        >
                          +
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
              <div className="training-exercise-card__materials-item">
                <div className="training-exercise-card__materials-placeholder">
                  <Video size={28} strokeWidth={1.6} />

                  {feedbackSetId === materialsModalSetId && (
                    <span className="training-exercise-card__materials-plus">
                      +
                    </span>
                  )}
                </div>
              </div>

              <div className="training-exercise-card__materials-comment">
                <MessageSquare size={24} strokeWidth={1.6} />

                <textarea
                  placeholder="Комментарий"
                  disabled={feedbackSetId !== materialsModalSetId}
                />

                {feedbackSetId === materialsModalSetId && (
                  <button
                    type="button"
                    className="training-exercise-card__materials-voice"
                    aria-label="Добавить голосовое сообщение"
                  >
                    🎙
                  </button>
                )}
              </div>
            </div>
            {selectedPhoto ? (
              <div
                ref={photoViewerRef}
                className="training-exercise-card__photo-viewer"
                role="dialog"
                aria-modal="true"
                aria-label="Просмотр фотографии"
                tabIndex={-1}
                onKeyDown={handlePhotoViewerKeyDown}
                onTouchStart={handlePhotoTouchStart}
                onTouchMove={handlePhotoTouchMove}
                onTouchEnd={handlePhotoTouchEnd}
                onWheel={handlePhotoWheel}
                onClick={handleClosePhotoViewer}
              >
                <button
                  type="button"
                  className="training-exercise-card__photo-viewer-close"
                  onClick={handleClosePhotoViewer}
                  aria-label="Закрыть"
                >
                  ×
                </button>

                {selectedPhotoIndex > 0 && (
                  <button
                    type="button"
                    className="training-exercise-card__photo-viewer-nav training-exercise-card__photo-viewer-nav--previous"
                    onClick={(event) => {
                      event.stopPropagation();
                      handlePreviousPhoto();
                    }}
                    aria-label="Предыдущая фотография"
                  >
                    ‹
                  </button>
                )}

                <div className="training-exercise-card__photo-viewer-stage">
                  <img
                    className="training-exercise-card__photo-viewer-image"
                    src={selectedPhoto.previewUrl}
                    alt={`Фото ${(selectedPhotoIndex ?? 0) + 1}`}
                    draggable="false"
                    style={{
                      transform: `translate3d(${photoPosition.x}px, ${photoPosition.y}px, 0) scale(${photoZoom})`,
                    }}
                    onClick={(event) => event.stopPropagation()}
                    onPointerDown={handlePhotoPointerDown}
                    onPointerMove={handlePhotoPointerMove}
                    onPointerUp={handlePhotoPointerUp}
                    onPointerCancel={handlePhotoPointerUp}
                  />
                </div>

                {selectedPhotoIndex < photoFiles.length - 1 && (
                  <button
                    type="button"
                    className="training-exercise-card__photo-viewer-nav training-exercise-card__photo-viewer-nav--next"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleNextPhoto();
                    }}
                    aria-label="Следующая фотография"
                  >
                    ›
                  </button>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </article>
  );
}
