import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import "./TrainingTimePopover.css";
import WheelPicker from "../picker/WheelPicker";

export default function TrainingTimePopover({
  anchorRef,
  value,
  onChange,
  onClose,
}) {
  const popoverRef = useRef(null);
  const anchorNodeRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const closeTimeoutRef = useRef(null);
  const animationStateRef = useRef("entering");
  const [positionStyle, setPositionStyle] = useState(null);
  const lastPositionRef = useRef({ top: null, right: null });
  const [animationState, setAnimationState] = useState("entering");
  const hoursValues = useMemo(
    () => Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0")),
    [],
  );
  const minutesValues = useMemo(
    () => Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0")),
    [],
  );

  const parseTime = (timeValue) => {
    if (typeof timeValue !== "string") {
      return { hours: "00", minutes: "00" };
    }

    const matched = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(timeValue);

    if (!matched) {
      return { hours: "00", minutes: "00" };
    }

    return { hours: matched[1], minutes: matched[2] };
  };

  const parsedTime = parseTime(value);
  const selectedHours = parsedTime.hours;
  const selectedMinutes = parsedTime.minutes;

  const emitTimeChange = (nextHours, nextMinutes) => {
    onChange(`${nextHours}:${nextMinutes}`);
  };

  const handleHoursChange = (nextHours) => {
    emitTimeChange(nextHours, selectedMinutes);
  };

  const handleMinutesChange = (nextMinutes) => {
    emitTimeChange(selectedHours, nextMinutes);
  };

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

  if (!isPositioned) {
    return null;
  }

  return (
    <div
      ref={(node) => {
        popoverRef.current = node;
      }}
      style={positionStyle}
      className={`training-time-popover training-time-popover--${animationState}`}
    >
      <div className="training-time-popover__content">
        <div
          className="training-time-popover__wheels"
          aria-label="Выбор времени"
        >
          <div className="training-time-popover__column">
            <WheelPicker
              values={hoursValues}
              selectedValue={selectedHours}
              onChange={handleHoursChange}
            />
          </div>

          <div className="training-time-popover__separator" aria-hidden="true">
            :
          </div>

          <div className="training-time-popover__column">
            <WheelPicker
              values={minutesValues}
              selectedValue={selectedMinutes}
              onChange={handleMinutesChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
