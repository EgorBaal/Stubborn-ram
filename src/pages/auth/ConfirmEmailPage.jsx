export default function ConfirmEmailPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#080808",
        color: "#fff",
        padding: "24px",
      }}
    >
      <div
        style={{
          maxWidth: "420px",
          width: "100%",
          background: "#111",
          borderRadius: "22px",
          padding: "36px",
          textAlign: "center",
          border: "1px solid #242424",
        }}
      >
        <div style={{ fontSize: "58px", marginBottom: "16px" }}>✅</div>

        <h1 style={{ marginBottom: "16px" }}>
          Почта подтверждена
        </h1>

        <p style={{ color: "#b8b8b8" }}>
          Теперь вы можете войти в свой аккаунт.
        </p>
      </div>
    </div>
  );
}