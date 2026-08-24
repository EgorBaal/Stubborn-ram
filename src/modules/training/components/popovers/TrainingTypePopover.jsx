import { useEffect, useLayoutEffect, useRef, useState } from "react";

import "./TrainingTypePopover.css";

const CLOSE_ANIMATION_MS = 270;

export default function TrainingTypePopover({
  anchorRef,
  options,
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
  const isPositioned = positionStyle != null;

  useLayoutEffect(() => {
    anchorNodeRef.current = anchorNode;

    if (!anchorNode) {
      setPositionStyle(null);
      return;
    }

    const updatePosition = () => {
      const rect = anchorNode.getBoundingClientRect();

      const popupWidth =
        popoverRef.current?.getBoundingClientRect().width ??
        Math.min(236, window.innerWidth - 20);

      const gap = 8;
      const viewportGap = 10;
      const nextTop = Math.round(rect.bottom + gap);

      const maxLeft = window.innerWidth - popupWidth - viewportGap;
      const desiredLeft = rect.right - popupWidth;
      const nextLeft = Math.round(
        Math.max(viewportGap, Math.min(desiredLeft, maxLeft)),
      );

      setPositionStyle({
        position: "fixed",
        top: `${nextTop}px`,
        left: `${nextLeft}px`,
        right: "auto",
      });
    };

    const handleScroll = (event) => {
      const target = event.target;

      if (target instanceof Node && popoverRef.current?.contains(target)) {
        return;
      }

      updatePosition();
    };

    updatePosition();
    const measureRaf = requestAnimationFrame(() => {
      updatePosition();
    });

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      cancelAnimationFrame(measureRaf);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [anchorNode]);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    onCloseStartRef.current = onCloseStart;
  }, [onCloseStart]);

  useEffect(() => {
    animationStateRef.current = animationState;
  }, [animationState]);

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

  return (
    <div
      ref={(node) => {
        popoverRef.current = node;
      }}
      style={positionStyle}
      className={`training-type-popover training-type-popover--${animationState}`}
    >
      <div className="training-type-popover__content" role="listbox">
        {options.map((option) => {
          const isSelected = option === value;

          return (
            <button
              key={option}
              type="button"
              className={`training-type-popover__option${isSelected ? " training-type-popover__option--selected" : ""}`}
              onClick={() => {
                onChange(option);
                requestClose();
              }}
              role="option"
              aria-selected={isSelected}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
