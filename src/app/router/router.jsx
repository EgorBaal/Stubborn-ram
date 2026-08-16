import { createBrowserRouter } from "react-router-dom";

import landingRoutes from "./landingRoutes";
import authRoutes from "./authRoutes";
import questionnaireRoutes from "./questionnaireRoutes";
import appRoutes from "./appRoutes";
import testRoutes from "./testRoutes";

const router = createBrowserRouter([
  ...landingRoutes,
  ...authRoutes,
  ...questionnaireRoutes,
  ...appRoutes,
  ...testRoutes,
]);

export default router;
