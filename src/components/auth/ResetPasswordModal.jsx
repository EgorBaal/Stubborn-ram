import { useCallback, useEffect, useRef, useState } from "react";

import logo from "../../assets/obshee-logo.png";

import { resetPassword } from "@/services/auth/authService";
import { getAuthErrorMessage } from "@/services/auth/authErrors";

import "./AuthModal.css";

const CLOSE_ANIMATION_MS = 280;

export default function ResetPasswordModal({ onClose }) {
  const [isClosing, setIsClosing] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [email, setEmail] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const closeTimerRef = useRef(null);

  const requestClose = useCallback(() => {
    if (isClosing || isClosed) {
      return;
    }

    setIsClosing(true);

    closeTimerRef.current = window.setTimeout(() => {
      setIsClosed(true);

      if (onClose) {
        onClose();
      }
    }, CLOSE_ANIMATION_MS);
  }, [isClosing, isClosed]);

  async function handleResetPassword() {
    setError("");
    setSuccess("");

    const { error } = await resetPassword(email);

    if (error) {
      setError(getAuthErrorMessage(error));
      return;
    }

    setSuccess(
      "Мы отправили письмо для восстановления пароля. Проверьте вашу электронную почту.",
    );
  }

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;

      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        requestClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [requestClose]);

  if (isClosed) {
    return null;
  }

  return (
    <div
      className={`auth-overlay ${isClosing ? "auth-overlay--closing" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Восстановление пароля"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          requestClose();
        }
      }}
    >
      <div className={`auth-modal ${isClosing ? "auth-modal--closing" : ""}`}>
        <button
          type="button"
          className="auth-close"
          aria-label="Закрыть"
          onClick={requestClose}
        >
          <span aria-hidden="true">×</span>
        </button>

        <img className="auth-logo" src={logo} alt="Stubborn Ram" />
        <p className="auth-description">
          Введите email, который использовался при регистрации. Мы отправим
          ссылку для восстановления пароля.
        </p>

        <form
          className="auth-form"
          onSubmit={(event) => event.preventDefault()}
        >
          <label className="auth-field" htmlFor="auth-email">
            <input
              id="auth-email"
              className="auth-input"
              type="email"
              autoComplete="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          {error && (
            <div className="auth-message auth-message--error">{error}</div>
          )}

          {success && (
            <div className="auth-message auth-message--success">{success}</div>
          )}

          <button
            type="button"
            className="auth-action auth-action--primary"
            onClick={handleResetPassword}
          >
            Отправить ссылку
          </button>
        </form>
      </div>
    </div>
  );
}
