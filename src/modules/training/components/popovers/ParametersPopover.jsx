import { createPortal } from "react-dom";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import "./ParametersPopover.css";

const CLOSE_ANIMATION_MS = 270;

const parameters = [
  {
    id: "weight",
    label: "Вес",
    defaultSelected: true,
  },
  {
    id: "repetitions",
    label: "Повторения",
    defaultSelected: true,
  },
  {
    id: "difficulty",
    label: "Сложность",
    defaultSelected: true,
  },
  {
    id: "distance",
    label: "Расстояние",
    defaultSelected: false,
  },
  {
    id: "calories",
    label: "Калории",
    defaultSelected: false,
  },
  {
    id: "speed",
    label: "Скорость",
    defaultSelected: false,
  },
  {
    id: "power",
    label: "Мощность",
    defaultSelected: false,
  },
  {
    id: "incline",
    label: "Наклон",
    defaultSelected: false,
  },
  {
    id: "time",
    label: "Время",
    defaultSelected: false,
  },
  {
    id: "rir",
    label: "RIR",
    defaultSelected: false,
  },
  {
    id: "rpe",
    label: "RPE",
    defaultSelected: false,
  },
];

export default function ParametersPopover({
  anchorRef,
  selectedParameters,
  onChange,
  isSupersetSelected = false,
  onSupersetToggle,
  onClose,
}) {
  const popoverRef = useRef(null);
  const anchorNodeRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const closeTimeoutRef = useRef(null);
  const animationStateRef = useRef("entering");

  const [positionStyle, setPositionStyle] = useState(null);
  const [animationState, setAnimationState] = useState("entering");

  const anchorNode = anchorRef?.current ?? null;
  const isPositioned = positionStyle != null;

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

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
        popoverRef.current?.getBoundingClientRect().width ??
        Math.min(336, window.innerWidth - 20);

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
      className={`training-parameters-popover training-parameters-popover--${animationState}`}
    >
      <div className="training-parameters-popover__content">
        <div className="training-parameters-popover__title">
          Параметры упражнения
        </div>

        <div className="training-parameters-popover__grid">
          {parameters.map((parameter) => {
            const isSelected = selectedParameters.includes(parameter.id);

            return (
              <button
                key={parameter.id}
                type="button"
                className={`training-parameters-popover__option${
                  isSelected
                    ? " training-parameters-popover__option--selected"
                    : ""
                }`}
                onClick={() => {
                  if (isSelected) {
                    onChange(
                      selectedParameters.filter(
                        (selectedParameter) =>
                          selectedParameter !== parameter.id,
                      ),
                    );

                    return;
                  }

                  onChange([...selectedParameters, parameter.id]);
                }}
                aria-pressed={isSelected}
              >
                {parameter.label}
              </button>
            );
          })}
          <button
            type="button"
            className={`training-parameters-popover__option${
              isSupersetSelected
                ? " training-parameters-popover__option--selected"
                : ""
            }`}
            onClick={() => {
              onSupersetToggle?.();
            }}
            aria-pressed={isSupersetSelected}
          >
            Суперсет
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(popover, document.body);
}
