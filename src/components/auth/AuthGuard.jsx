import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { getSession } from "@/services/auth/authService";

export default function AuthGuard({ children }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    async function checkSession() {
      const { data } = await getSession();

      setSession(data.session);
      setLoading(false);
    }

    checkSession();
  }, []);

  if (loading) {
    return null;
  }

  if (!session) {
    return <Navigate to="/" replace />;
  }

  return children;
}