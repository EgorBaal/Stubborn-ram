import { useEffect } from "react";
import "./ConfirmModal.css";
export default function ConfirmModal({
  open,
  title,
  message,
  confirmText = "Подтвердить",
  cancelText = "Отмена",
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);
  if (!open) return null;

  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
        <h2>{title}</h2>

        <p>{message}</p>

        <div className="confirm-buttons">
          <button className="confirm-cancel" onClick={onCancel}>
            {cancelText}
          </button>

          <button className="confirm-confirm" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
