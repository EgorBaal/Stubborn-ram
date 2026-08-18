import "./ConfirmEmailPage.css";

export default function ConfirmEmailPage() {
  return (
    <div className="confirm-email-page">
      <div className="confirm-email-card">
        <div className="confirm-email-icon">✅</div>

        <h1 className="confirm-email-title">Почта подтверждена</h1>

        <p className="confirm-email-text">
          Теперь вы можете войти в свой аккаунт.
        </p>
      </div>
    </div>
  );
}
