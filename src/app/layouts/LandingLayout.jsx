import LandingPage from "@/pages/landing/LandingPage";
import "./LandingLayout.css";

export default function LandingLayout() {
  return (
    <div className="landing-shell">
      <div className="landing-page">
        <LandingPage />
      </div>
    </div>
  );
}
