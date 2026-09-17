import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { verifyEmail } from "@/services/auth/authService";
import "./ConfirmEmailPage.css";

export default function ConfirmEmailPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      return;
    }

    let cancelled = false;

    async function confirmEmail() {
      const { error } = await verifyEmail(token);

      if (cancelled) return;

      setStatus(error ? "error" : "success");
    }

    confirmEmail();

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  return (
    <div className="confirm-email-page">
      <div className="confirm-email-card">
        {status === "loading" && (
          <>
            <div className="confirm-email-icon">...</div>
            <h1 className="confirm-email-title">Подтверждаем email</h1>
            <p className="confirm-email-text">Пожалуйста, подождите.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="confirm-email-icon">✓</div>
            <h1 className="confirm-email-title">Почта подтверждена</h1>
            <p className="confirm-email-text">
              Теперь вы можете войти в свой аккаунт.
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="confirm-email-icon">!</div>
            <h1 className="confirm-email-title">
              Не удалось подтвердить email
            </h1>
            <p className="confirm-email-text">
              Ссылка недействительна или срок её действия истёк.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
