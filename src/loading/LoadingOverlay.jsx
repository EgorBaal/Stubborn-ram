import { useContext } from "react";

import { LoadingContext } from "./LoadingContext";
import LoadingScreen from "./LoadingScreen";
import "./loading.css";

export default function LoadingOverlay() {
  const context = useContext(LoadingContext);
  const isLoading = context?.isLoading ?? false;

  if (!isLoading) {
    return null;
  }

  return (
    <div className="loading-overlay" role="presentation">
      <LoadingScreen />
    </div>
  );
}
