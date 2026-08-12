import LandingLayout from "@/app/layouts/LandingLayout";
import { PublicRoute } from "@/components/auth/AuthGuard";

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
