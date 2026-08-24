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
  anchorRef,
}) {
  const popoverRef = useRef(null);
  const anchorNodeRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const closeTimeoutRef = useRef(null);
  const animationStateRef = useRef("entering");
  const [positionStyle, setPositionStyle] = useState(null);
  const lastPositionRef = useRef({ top: null, right: null });
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
      const nextTop = Math.round(rect.bottom + 4);
      const nextRight = Math.round(window.innerWidth - rect.right);

      if (
        lastPositionRef.current.top === nextTop &&
        lastPositionRef.current.right === nextRight
      ) {
        return;
      }

      lastPositionRef.current = { top: nextTop, right: nextRight };
      setPositionStyle({
        position: "fixed",
        top: `${nextTop}px`,
        right: `${nextRight}px`,
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
    window.addEventListener("resize", updatePosition);
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

      monthNode.textContent = text.charAt(0).toUpperCase() + text.slice(1);
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
