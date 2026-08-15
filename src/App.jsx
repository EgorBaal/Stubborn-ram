import "./App.css";
import { RouterProvider } from "react-router-dom";
import router from "@/app/router/router";
import { LoadingOverlay } from "@/loading";
import StartupScreenGate from "@/app/splash/StartupScreenGate";
import { useAuth } from "@/contexts/AuthContext";

function App() {
  const { session, loading } = useAuth();

  const appContent = <RouterProvider router={router} />;

  const contentWithOptionalStartup =
    loading || !session ? (
      appContent
    ) : (
      <StartupScreenGate>{appContent}</StartupScreenGate>
    );

  return (
    <>
      {contentWithOptionalStartup}

      <LoadingOverlay />
    </>
  );
}

export default App;
