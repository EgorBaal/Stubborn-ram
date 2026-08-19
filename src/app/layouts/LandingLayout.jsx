import LandingPage from "@/pages/landing/LandingPage";
import ScrollToTop from "@/components/common/ScrollToTop";

import "./LandingLayout.css";

export default function LandingLayout() {
  return (
    <>
      <ScrollToTop />

      <div className="landing-shell">
        <div className="landing-page">
          <LandingPage />
        </div>
      </div>
    </>
  );
}
