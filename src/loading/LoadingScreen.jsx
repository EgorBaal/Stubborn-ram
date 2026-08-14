import logoSrc from "@/assets/obshee-logo.png";

import "./loading.css";

export default function LoadingScreen() {
  return (
    <div
      className="loading-screen"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <img className="loading-screen__logo" src={logoSrc} alt="Stubborn Ram" />
    </div>
  );
}
