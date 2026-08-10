import LoginPage from "@/pages/auth/LoginPage";
import ConfirmEmailPage from "@/pages/auth/ConfirmEmailPage";

const authRoutes = [
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/auth/confirm",
    element: <ConfirmEmailPage />,
  },
];

export default authRoutes;
