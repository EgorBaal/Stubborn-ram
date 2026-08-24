import { useEffect, useLayoutEffect, useRef, useState } from "react";

import "./DatePopover.css";

import DatePicker, { registerLocale } from "react-datepicker";
import { ru } from "date-fns/locale";

import "react-datepicker/dist/react-datepicker.css";

registerLocale("ru", ru);

export default function DatePopover({
  trainingDate,
  setTrainingDate,
  onClose,
  onCloseStart,
  anchorRef,
}) {
  const popoverRef = useRef(null);
  const anchorNodeRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const onCloseStartRef = useRef(onCloseStart);
  const closeTimeoutRef = useRef(null);
  const animationStateRef = useRef("entering");

  const [positionStyle, setPositionStyle] = useState(null);
  const lastPositionRef = useRef({
    top: null,
    left: null,
  });

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
        popoverRef.current?.getBoundingClientRect().width ?? 390;

      const gap = 8;
      const viewportGap = 10;

      const isMobile = window.innerWidth <= 430;

      const nextTop = Math.round(rect.bottom + gap);

      if (isMobile) {
        setPositionStyle({
          position: "fixed",
          top: `${nextTop}px`,
          left: `${viewportGap * 2}px`,
          right: "auto",
        });

        return;
      }

      const desiredLeft = rect.right - popupWidth;
      const nextLeft = Math.round(desiredLeft);

      if (
        lastPositionRef.current.top === nextTop &&
        lastPositionRef.current.left === nextLeft
      ) {
        return;
      }

      lastPositionRef.current = {
        top: nextTop,
        left: nextLeft,
      };

      setPositionStyle({
        position: "fixed",
        top: `${nextTop}px`,
        left: `${nextLeft}px`,
        right: "auto",
      });
    };

    updatePosition();

    window.addEventListener("resize", updatePosition);

    const handleScroll = (event) => {
      const target = event.target;

      if (target instanceof Node && popoverRef.current?.contains(target)) {
        return;
      }

      updatePosition();
    };

    window.addEventListener("scroll", handleScroll, true);

    return () => {
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
    }, 270);
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

  useEffect(() => {
    if (!isPositioned) {
      return;
    }

    const capitalizeMonthTitle = () => {
      const monthNode = popoverRef.current?.querySelector(
        ".react-datepicker__current-month",
      );

      if (!monthNode || typeof monthNode.textContent !== "string") {
        return;
      }

      const text = monthNode.textContent.trim();

      if (!text) {
        return;
      }

      const capitalized = text.charAt(0).toUpperCase() + text.slice(1);

      // ВАЖНО:
      // не записываем textContent, если он уже правильный.
      // Иначе MutationObserver запускает сам себя бесконечно.
      if (monthNode.textContent.trim() === capitalized) {
        return;
      }

      monthNode.textContent = capitalized;
    };

    capitalizeMonthTitle();

    const observer = new MutationObserver(() => {
      capitalizeMonthTitle();
    });

    if (popoverRef.current) {
      observer.observe(popoverRef.current, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }

    return () => {
      observer.disconnect();
    };
  }, [isPositioned]);

  if (!isPositioned) {
    return null;
  }

  return (
    <div
      ref={(node) => {
        popoverRef.current = node;
      }}
      style={positionStyle}
      className={`training-date-popover training-date-popover--${animationState}`}
    >
      <DatePicker
        inline
        locale="ru"
        selected={trainingDate}
        showPreviousMonths={false}
        fixedHeight
        onChange={(date) => {
          if (date) {
            setTrainingDate(date);
          }

          requestClose();
        }}
      />
    </div>
  );
}
