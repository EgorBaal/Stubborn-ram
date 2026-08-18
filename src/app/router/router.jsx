import { createBrowserRouter } from "react-router-dom";

import landingRoutes from "./landingRoutes";
import authRoutes from "./authRoutes";
import questionnaireRoutes from "./questionnaireRoutes";
import appRoutes from "./appRoutes";

const router = createBrowserRouter([
  ...landingRoutes,
  ...authRoutes,
  ...questionnaireRoutes,
  ...appRoutes,
]);

export default router;
