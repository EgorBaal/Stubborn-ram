import loadingVideoSrc from "@/assets/loading/stubborn-ram-loading.mp4";

import "./loading.css";

export default function LoadingScreen() {
  return (
    <div
      className="loading-screen"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <video
        className="loading-screen__video"
        src={loadingVideoSrc}
        autoPlay
        muted
        playsInline
        loop
        preload="auto"
      />
      <span className="loading-screen__sr-only">Loading</span>
    </div>
  );
}
