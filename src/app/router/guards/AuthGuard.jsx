import { Navigate } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";

export default function AuthGuard({ children }) {
  const { session, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!session) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export function PublicRoute({ children }) {
  const { session, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (session) {
    return <Navigate to="/app/home" replace />;
  }

  return children;
}
