import "./App.css";
import { RouterProvider } from "react-router-dom";
import router from "@/app/router/router";
import { LoadingOverlay } from "@/loading";

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <LoadingOverlay />
    </>
  );
}

export default App;
