import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#080808",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          padding: "32px",
          background: "#121212",
          borderRadius: "20px",
        }}
      >
        <h1 style={{ color: "white", marginBottom: "24px" }}>Вход</h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            marginBottom: "16px",
            padding: "14px",
            borderRadius: "10px",
            border: "1px solid #333",
            background: "#1b1b1b",
            color: "white",
            boxSizing: "border-box",
          }}
        />

        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            marginBottom: "24px",
            padding: "14px",
            borderRadius: "10px",
            border: "1px solid #333",
            background: "#1b1b1b",
            color: "white",
            boxSizing: "border-box",
          }}
        />

        <button
          style={{
            width: "100%",
            padding: "14px",
            border: "none",
            borderRadius: "10px",
            background: "#ff6200",
            color: "white",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Войти
        </button>
      </div>
    </div>
  );
}
