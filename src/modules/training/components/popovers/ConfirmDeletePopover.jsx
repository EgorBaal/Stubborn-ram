import { createPortal } from "react-dom";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import "./ConfirmDeletePopover.css";

const CLOSE_ANIMATION_MS = 270;

export default function ConfirmDeletePopover({
  anchorRef,
  open,
  onConfirm,
  onCancel,
}) {
  const popoverRef = useRef(null);
  const anchorNodeRef = useRef(null);
  const onCancelRef = useRef(onCancel);
  const closeTimeoutRef = useRef(null);
  const animationStateRef = useRef("entering");

  const [positionStyle, setPositionStyle] = useState(null);
  const [animationState, setAnimationState] = useState("entering");

  const anchorNode = anchorRef?.current ?? null;
  const isPositioned = positionStyle != null;

  useEffect(() => {
    onCancelRef.current = onCancel;
  }, [onCancel]);

  useEffect(() => {
    animationStateRef.current = animationState;
  }, [animationState]);

  useLayoutEffect(() => {
    if (!open) {
      setPositionStyle(null);
      return;
    }

    anchorNodeRef.current = anchorNode;

    if (!anchorNode) {
      setPositionStyle(null);
      return;
    }

    const updatePosition = () => {
      const anchorRect = anchorNode.getBoundingClientRect();

      const popupWidth =
        popoverRef.current?.getBoundingClientRect().width ??
        Math.min(280, window.innerWidth - 40);

      const popupHeight =
        popoverRef.current?.getBoundingClientRect().height ?? 0;

      const gap = 8;
      const viewportGap = 10;

      let desiredLeft = anchorRect.left + anchorRect.width / 2 - popupWidth / 2;

      const minLeft = viewportGap;
      const maxLeft = window.innerWidth - popupWidth - viewportGap;

      desiredLeft = Math.max(minLeft, Math.min(desiredLeft, maxLeft));

      let finalTop = anchorRect.top - popupHeight - gap;

      if (finalTop < viewportGap) {
        finalTop = anchorRect.bottom + gap;
      }

      setPositionStyle({
        position: "fixed",
        top: `${Math.round(finalTop)}px`,
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
  }, [anchorNode, open]);

  useEffect(() => {
    if (!open || !isPositioned) {
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
  }, [open, isPositioned]);

  const requestClose = () => {
    if (animationStateRef.current === "leaving") {
      return;
    }

    setAnimationState("leaving");

    closeTimeoutRef.current = setTimeout(() => {
      onCancelRef.current?.();
    }, CLOSE_ANIMATION_MS);
  };

  useEffect(() => {
    if (!open) {
      return;
    }

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
  }, [open]);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  if (!open || !isPositioned) {
    return null;
  }

  const popover = (
    <div
      ref={(node) => {
        popoverRef.current = node;
      }}
      style={positionStyle}
      className={`training-confirm-delete-popover training-confirm-delete-popover--${animationState}`}
    >
      <div className="training-confirm-delete-popover__content">
        <div className="training-confirm-delete-popover__title">
          Удалить упражнение?
        </div>

        <div className="training-confirm-delete-popover__actions">
          <button
            type="button"
            className="training-confirm-delete-popover__option"
            onClick={requestClose}
          >
            Нет
          </button>

          <button
            type="button"
            className="training-confirm-delete-popover__option training-confirm-delete-popover__option--confirm"
            onClick={() => {
              onConfirm?.();
            }}
          >
            Да
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(popover, document.body);
}
