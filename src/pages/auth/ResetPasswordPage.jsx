import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import logo from "@/assets/obshee-logo.png";

import "@/components/auth/AuthModal.css";
import { updatePassword } from "@/services/auth/authService";
import { getAuthErrorMessage } from "@/services/auth/authErrors";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSavePassword() {
    setError("");
    setSuccess("");

    const token = searchParams.get("token");

    if (!token) {
      setError("Ссылка для восстановления пароля недействительна.");
      return;
    }

    if (password.length < 8) {
      setError("Пароль должен содержать минимум 8 символов.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Пароли не совпадают.");
      return;
    }

    const { error } = await updatePassword(password, token);

    if (error) {
      setError(getAuthErrorMessage(error));
      return;
    }

    setSuccess("Пароль успешно изменён.");

    setTimeout(() => {
      navigate("/");
    }, 1500);
  }

  return (
    <div className="auth-overlay">
      <div className="auth-modal">
        <img className="auth-logo" src={logo} alt="Stubborn Ram" />

        <p className="auth-description">
          Введите новый пароль для вашей учетной записи.
        </p>

        <div className="auth-form">
          <input
            className="auth-input"
            type="password"
            autoComplete="new-password"
            placeholder="Новый пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <input
            className="auth-input"
            type="password"
            autoComplete="new-password"
            placeholder="Повторите пароль"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          {error && (
            <div className="auth-message auth-message--error">{error}</div>
          )}

          {success && (
            <div className="auth-message auth-message--success">{success}</div>
          )}

          <button
            type="button"
            className="auth-action auth-action--primary"
            onClick={handleSavePassword}
          >
            Сохранить пароль
          </button>
        </div>
      </div>
    </div>
  );
}
