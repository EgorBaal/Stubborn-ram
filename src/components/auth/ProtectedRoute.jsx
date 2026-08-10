import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // Ждем, пока Supabase восстановит сессию
  if (loading) {
    return <div>Загрузка...</div>;
  }

  // Пользователь не авторизован
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Пользователь авторизован
  return children;
}
