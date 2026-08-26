import { useLayoutEffect, useRef } from "react";

import "./TrainingComment.css";

export default function TrainingComment({ value, onChange }) {
  const fieldRef = useRef(null);

  useLayoutEffect(() => {
    const field = fieldRef.current;

    if (!field) {
      return;
    }

    field.style.height = "auto";
    field.style.height = `${field.scrollHeight}px`;
  }, [value]);

  return (
    <div className="training-comment">
      <h2 className="training-comment__title">Комментарий к тренировке</h2>

      <textarea
        ref={fieldRef}
        className="training-comment__field"
        placeholder="Введите комментарий"
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
        }}
        rows={3}
      />
    </div>
  );
}
