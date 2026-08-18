import LandingLayout from "@/app/layouts/LandingLayout";
import { PublicRoute } from "@/app/router/guards/AuthGuard";

const landingRoutes = [
  {
    path: "/",
    element: (
      <PublicRoute>
        <LandingLayout />
      </PublicRoute>
    ),
  },
];

export default landingRoutes;
