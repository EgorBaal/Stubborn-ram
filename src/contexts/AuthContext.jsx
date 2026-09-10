import { createContext, useContext, useEffect, useState } from "react";
import { getSession } from "@/services/auth/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  async function refreshSession() {
    try {
      const {
        data: { session },
      } = await getSession();

      setSession(session);
      setUser(session?.user ?? null);

      return session;
    } catch (error) {
      console.error("шибка восстановления сессии:", error);
      setSession(null);
      setUser(null);
      return null;
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
