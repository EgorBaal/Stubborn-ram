import { createContext, useContext, useEffect, useState } from "react";
import { getSession } from "@/services/auth/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  async function refreshSession() {
    try {
      const result = await getSession();

      if (result.error) {
        if (result.status === 401) {
          setSession(null);
          setUser(null);
          return null;
        }

        console.error("Ошибка восстановления сессии:", result.error);

        return session;
      }

      const nextSession = result.data?.session ?? null;

      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      return nextSession;
    } catch (error) {
      console.error("Ошибка восстановления сессии:", error);

      return session;
    }
  }

  useEffect(() => {
    refreshSession().finally(() => {
      setLoading(false);
    });
  }, []);

  const value = {
    user,
    session,
    loading,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth должен использоваться внутри AuthProvider");
  }

  return context;
}
