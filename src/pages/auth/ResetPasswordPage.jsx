import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "@/lib/supabaseClient";

import logo from "@/assets/obshee-logo.png";

import "@/components/auth/AuthModal.css";

export default function ResetPasswordPage() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSavePassword() {
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

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setError(error.message);
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
            placeholder="Новый пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <input
            className="auth-input"
            type="password"
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
