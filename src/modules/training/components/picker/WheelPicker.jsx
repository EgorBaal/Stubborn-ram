import { useEffect, useLayoutEffect, useMemo, useRef } from "react";

import "./WheelPicker.css";

const ITEM_HEIGHT = 30;
const SNAP_DELAY_MS = 180;
const VISIBLE_RADIUS = 3;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export default function WheelPicker({ values, selectedValue, onChange }) {
  const viewportRef = useRef(null);
  const snapTimeoutRef = useRef(null);
  const isSyncingRef = useRef(false);
  const isInitializedRef = useRef(false);

  const selectedIndex = useMemo(() => {
    const index = values.indexOf(selectedValue);
    return index === -1 ? 0 : index;
  }, [values, selectedValue]);

  const updateVisualState = (centerIndex) => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    const items = viewport.querySelectorAll(".wheel-picker__item");

    items.forEach((item, index) => {
      const distance = clamp(
        index - centerIndex,
        -VISIBLE_RADIUS,
        VISIBLE_RADIUS,
      );
      item.dataset.distance = String(distance);
      item.dataset.active = distance === 0 ? "true" : "false";
    });
  };

  const scrollToIndex = (index, behavior = "smooth") => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    viewport.scrollTo({
      top: index * ITEM_HEIGHT,
      behavior,
    });

    updateVisualState(index);
  };

  useLayoutEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport || values.length === 0) {
      return;
    }

    const targetTop = selectedIndex * ITEM_HEIGHT;

    if (!isInitializedRef.current) {
      isSyncingRef.current = true;
      scrollToIndex(selectedIndex, "auto");
      isSyncingRef.current = false;
      isInitializedRef.current = true;
      return;
    }

    if (Math.abs(viewport.scrollTop - targetTop) > ITEM_HEIGHT * 0.5) {
      isSyncingRef.current = true;
      scrollToIndex(selectedIndex, "auto");
      isSyncingRef.current = false;
    } else {
      updateVisualState(Math.round(viewport.scrollTop / ITEM_HEIGHT));
    }
  }, [selectedIndex, values.length]);

  useEffect(() => {
    return () => {
      if (snapTimeoutRef.current) {
        clearTimeout(snapTimeoutRef.current);
      }
    };
  }, []);

  const handleScroll = () => {
    if (isSyncingRef.current || values.length === 0) {
      return;
    }

    const viewport = viewportRef.current;

    if (viewport) {
      updateVisualState(Math.round(viewport.scrollTop / ITEM_HEIGHT));
    }

    if (snapTimeoutRef.current) {
      clearTimeout(snapTimeoutRef.current);
    }

    snapTimeoutRef.current = setTimeout(() => {
      const viewport = viewportRef.current;

      if (!viewport) {
        return;
      }

      const maxIndex = values.length - 1;
      const snappedIndex = clamp(
        Math.round(viewport.scrollTop / ITEM_HEIGHT),
        0,
        maxIndex,
      );
      const snappedValue = values[snappedIndex];

      if (snappedValue !== selectedValue) {
        onChange(snappedValue);
      }

      isSyncingRef.current = true;
      scrollToIndex(snappedIndex, "smooth");
      isSyncingRef.current = false;
    }, SNAP_DELAY_MS);
  };

  return (
    <div className="wheel-picker" role="listbox" aria-label="Выбор значения">
      <div
        className="wheel-picker__viewport"
        ref={viewportRef}
        onScroll={handleScroll}
      >
        {values.map((item, index) => (
          <button
            key={item}
            type="button"
            role="option"
            aria-selected={index === selectedIndex}
            className="wheel-picker__item"
            onClick={() => {
              onChange(item);
              isSyncingRef.current = true;
              scrollToIndex(index, "smooth");
              isSyncingRef.current = false;
            }}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
