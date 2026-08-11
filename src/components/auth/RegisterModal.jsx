import { useCallback, useEffect, useRef, useState } from "react";

import logo from "../../assets/obshee-logo.png";

import { signUp } from "@/services/auth/authService";
import { getAuthErrorMessage } from "@/services/auth/authErrors";

import "./AuthModal.css";

const CLOSE_ANIMATION_MS = 280;

export default function RegisterModal({ onClose }) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

  async function handleSignUp() {
    setError("");
    setSuccess("");
    if (password.length < 6) {
      setError("Пароль должен содержать минимум 6 символов.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Пароли не совпадают.");
      return;
    }

    const { error } = await signUp(email, password);

    if (error) {
      setError(getAuthErrorMessage(error));
      return;
    }

    setSuccess(
      "Регистрация почти завершена. Проверьте электронную почту и подтвердите аккаунт.",
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
      aria-label="Авторизация"
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

          <label className="auth-field" htmlFor="auth-password">
            <div className="auth-password-wrap">
              <input
                id="auth-password"
                className="auth-input auth-input--password"
                type={isPasswordVisible ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                type="button"
                className="auth-password-toggle"
                aria-label={
                  isPasswordVisible ? "Скрыть пароль" : "Показать пароль"
                }
                onClick={() => setIsPasswordVisible((visible) => !visible)}
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="auth-password-icon"
                >
                  {isPasswordVisible ? (
                    <>
                      <path
                        d="M2 12s3.5-6 10-6s10 6 10 6s-3.5 6-10 6S2 12 2 12Z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      />
                    </>
                  ) : (
                    <>
                      <path
                        d="M2 12s3.5-6 10-6s10 6 10 6s-3.5 6-10 6S2 12 2 12Z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M4 4l16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </>
                  )}
                </svg>
              </button>
            </div>
          </label>

          <label className="auth-field" htmlFor="auth-confirm-password">
            <input
              id="auth-confirm-password"
              className="auth-input"
              type={isPasswordVisible ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Повторите пароль"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            onClick={handleSignUp}
          >
            Зарегистрироваться
          </button>
        </form>
      </div>
    </div>
  );
}
