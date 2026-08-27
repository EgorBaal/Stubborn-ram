import { createPortal } from "react-dom";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import "./DifficultyPopover.css";

const CLOSE_ANIMATION_MS = 270;

const difficultyOptions = [
  {
    value: "easy",
    label: "Легко",
    color: "#45c978",
  },
  {
    value: "medium",
    label: "Средне",
    color: "#d6ad32",
  },
  {
    value: "hard",
    label: "Сложно",
    color: "#e34848",
  },
];

export default function DifficultyPopover({
  anchorRef,
  value,
  onChange,
  onClose,
  onCloseStart,
}) {
  const popoverRef = useRef(null);
  const anchorNodeRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const onCloseStartRef = useRef(onCloseStart);
  const closeTimeoutRef = useRef(null);
  const animationStateRef = useRef("entering");

  const [positionStyle, setPositionStyle] = useState(null);
  const [animationState, setAnimationState] = useState("entering");

  const anchorNode = anchorRef?.current ?? null;
  const isPositioned = positionStyle !== null;

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    onCloseStartRef.current = onCloseStart;
  }, [onCloseStart]);

  useEffect(() => {
    animationStateRef.current = animationState;
  }, [animationState]);

  useLayoutEffect(() => {
    anchorNodeRef.current = anchorNode;

    if (!anchorNode) {
      setPositionStyle(null);
      return;
    }

    const updatePosition = () => {
      const anchorRect = anchorNode.getBoundingClientRect();

      const popupWidth =
        popoverRef.current?.getBoundingClientRect().width ?? 150;

      const popupHeight =
        popoverRef.current?.getBoundingClientRect().height ?? 0;

      const exerciseCard = anchorNode.closest(".training-exercise-card");

      const cardRect = exerciseCard?.getBoundingClientRect() ?? null;

      const gap = 8;
      const cardGap = 10;

      const nextTop = Math.round(anchorRect.bottom + gap);

      let minLeft = 10;
      let maxLeft = window.innerWidth - popupWidth - 10;

      if (cardRect) {
        minLeft = cardRect.left + cardGap;
        maxLeft = cardRect.right - popupWidth - cardGap;
      }

      let desiredLeft = anchorRect.left + anchorRect.width / 2 - popupWidth / 2;

      if (maxLeft < minLeft) {
        desiredLeft = minLeft;
      } else {
        desiredLeft = Math.max(minLeft, Math.min(desiredLeft, maxLeft));
      }

      let finalTop = nextTop;

      const viewportBottom = window.innerHeight - cardGap;

      if (popupHeight > 0 && finalTop + popupHeight > viewportBottom) {
        const topPosition = anchorRect.top - popupHeight - gap;

        if (topPosition >= cardGap) {
          finalTop = Math.round(topPosition);
        }
      }

      setPositionStyle({
        position: "fixed",
        top: `${finalTop}px`,
        left: `${Math.round(desiredLeft)}px`,
        right: "auto",
      });
    };

    updatePosition();

    const measureRaf = requestAnimationFrame(() => {
      updatePosition();
    });

    const handleScroll = () => {
      updatePosition();
    };

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      cancelAnimationFrame(measureRaf);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [anchorNode]);

  useEffect(() => {
    if (!isPositioned) {
      return;
    }

    setAnimationState("entering");

    const enterRaf = requestAnimationFrame(() => {
      setAnimationState("entered");
    });

    return () => {
      cancelAnimationFrame(enterRaf);

      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, [isPositioned]);

  const requestClose = () => {
    if (animationStateRef.current === "leaving") {
      return;
    }

    onCloseStartRef.current?.();

    setAnimationState("leaving");

    closeTimeoutRef.current = setTimeout(() => {
      onCloseRef.current?.();
    }, CLOSE_ANIMATION_MS);
  };

  useEffect(() => {
    const handlePointerDown = (event) => {
      const target = event.target;

      if (popoverRef.current?.contains(target)) {
        return;
      }

      if (anchorNodeRef.current?.contains(target)) {
        return;
      }

      anchorNodeRef.current?.blur();

      requestClose();
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  if (!isPositioned) {
    return null;
  }

  const popover = (
    <div
      ref={(node) => {
        popoverRef.current = node;
      }}
      style={positionStyle}
      className={`difficulty-popover difficulty-popover--${animationState}`}
    >
      <div className="difficulty-popover__content" role="listbox">
        {difficultyOptions.map((option) => {
          const isSelected = option.value === value;

          return (
            <button
              key={option.value}
              type="button"
              className={`difficulty-popover__option${
                isSelected ? " difficulty-popover__option--selected" : ""
              }`}
              onClick={() => {
                onChange(option.value);
                requestClose();
              }}
              role="option"
              aria-selected={isSelected}
            >
              <span
                className="difficulty-popover__dot"
                style={{
                  backgroundColor: option.color,
                }}
              />

              <span className="difficulty-popover__label">{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  return createPortal(popover, document.body);
}
