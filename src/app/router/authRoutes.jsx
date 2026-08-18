import { PublicRoute } from "@/app/router/guards/AuthGuard";
import ConfirmEmailPage from "@/pages/auth/ConfirmEmailPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";

const authRoutes = [
  {
    path: "/auth/confirm",
    element: (
      <PublicRoute>
        <ConfirmEmailPage />
      </PublicRoute>
    ),
  },
  {
    path: "/reset-password",
    element: (
      <PublicRoute>
        <ResetPasswordPage />
      </PublicRoute>
    ),
  },
];

export default authRoutes;
