import "./App.css";
import { RouterProvider } from "react-router-dom";
import router from "@/app/router/router";
import { LoadingProvider } from "@/loading";

function App() {
  return (
    <LoadingProvider>
      <RouterProvider router={router} />
    </LoadingProvider>
  );
}

export default App;
