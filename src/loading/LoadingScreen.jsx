import LoadingSpinner from "./LoadingSpinner";
import "./loading.css";

export default function LoadingScreen({ label = "Loading" }) {
  return (
    <div
      className="loading-screen"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <LoadingSpinner />
      <span className="loading-screen__label">{label}</span>
    </div>
  );
}
