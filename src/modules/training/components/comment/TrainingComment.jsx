import { useLayoutEffect, useRef } from "react";

import "./TrainingComment.css";

export default function TrainingComment({
  value,
  onChange,
  isReadOnly = false,
}) {
  const fieldRef = useRef(null);
  const hasValue = Boolean(value?.trim());

  useLayoutEffect(() => {
    const field = fieldRef.current;

    if (!field) {
      return;
    }

    field.style.height = "auto";
    field.style.height = `${field.scrollHeight}px`;
  }, [value]);

  if (isReadOnly && !hasValue) {
    return null;
  }

  return (
    <div className="training-comment">
      <h2 className="training-comment__title">Комментарий к тренировке</h2>

      <textarea
        ref={fieldRef}
        className="training-comment__field"
        placeholder={isReadOnly ? undefined : "Введите комментарий"}
        readOnly={isReadOnly}
        value={value ?? ""}
        onChange={(event) => {
          if (isReadOnly) {
            return;
          }

          onChange(event.target.value);
        }}
        rows={3}
      />
    </div>
  );
}
