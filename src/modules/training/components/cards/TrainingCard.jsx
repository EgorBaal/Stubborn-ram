import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./TrainingCard.css";

export default function TrainingCard({
  workout,
  title,
  date,
  onClick,
  onDelete,
  isDeleting = false,
}) {
  const navigate = useNavigate();

  const cardTitle = title ?? workout?.title;

  const cardDate =
    date ??
    (workout
      ? workout.createdAt.toLocaleDateString("ru-RU", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : null);

  const handleClick =
    onClick ?? (() => navigate(`/app/training/${workout.id}`));

  const [isSwiped, setIsSwiped] = useState(false);

  const swipeTouchRef = useRef({
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    directionLocked: false,
    isHorizontal: false,
  });

  useEffect(() => {
    if (!isDeleting) {
      return;
    }

    setIsSwiped(false);
  }, [isDeleting]);

  const handleTouchStart = (event) => {
    const touch = event.touches[0];

    if (!touch) {
      return;
    }

    swipeTouchRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
      directionLocked: false,
      isHorizontal: false,
    };
  };

  const handleTouchMove = (event) => {
    const swipe = swipeTouchRef.current;
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

  const handleTouchEnd = () => {
    const swipe = swipeTouchRef.current;

    const deltaX = swipe.currentX - swipe.startX;
    const deltaY = swipe.currentY - swipe.startY;

    if (
      swipe.directionLocked &&
      Math.abs(deltaX) >= 45 &&
      Math.abs(deltaX) > Math.abs(deltaY)
    ) {
      if (deltaX < 0 && !isSwiped) {
        setIsSwiped(true);
      } else if (deltaX > 0 && isSwiped) {
        setIsSwiped(false);
      }
    }

    swipeTouchRef.current = {
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      directionLocked: false,
      isHorizontal: false,
    };
  };

  const handleTouchCancel = () => {
    swipeTouchRef.current = {
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      directionLocked: false,
      isHorizontal: false,
    };
  };

  const handleDelete = async (event) => {
    event.stopPropagation();

    if (isDeleting) {
      return;
    }

    await onDelete?.();
  };

  return (
    <article
      className={`training-card${isSwiped ? " training-card--swiped" : ""}`}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
    >
      <div className="training-card__delete-actions">
        <button
          type="button"
          className="training-card__delete"
          onClick={handleDelete}
          disabled={isDeleting}
          aria-label="Удалить тренировку"
        >
          Удалить
        </button>
      </div>

      <div className="training-card__content">
        <h2 className="training-card__title">{cardTitle}</h2>

        <div className="training-card__right">
          {cardDate && <span className="training-card__date">{cardDate}</span>}

          <svg className="training-card__arrow" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 6L15 12L9 18"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </article>
  );
}
