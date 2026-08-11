import LoginPage from "@/pages/auth/LoginPage";
import ConfirmEmailPage from "@/pages/auth/ConfirmEmailPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";

const authRoutes = [
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/auth/confirm",
    element: <ConfirmEmailPage />,
  },
  {
    path: "/reset-password",
    element: <ResetPasswordPage />,
  },
];

export default authRoutes;
