import { useCallback, useEffect, useMemo, useState } from "react";
import { apiErrorMessage, authApi } from "../services/api";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const applySession = useCallback((data) => {
    setUser(data?.user ?? null);
    setProfile(data?.profile ?? null);
    setRole(data?.role ?? null);
  }, []);

  const clearSession = useCallback(() => {
    setUser(null);
    setProfile(null);
    setRole(null);
  }, []);

  const loadProfile = useCallback(async () => {
    const data = await authApi.me();
    applySession(data);
    return data;
  }, [applySession]);

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      try {
        // Prepara el token CSRF antes del primer formulario.
        await authApi.csrf();
        const data = await authApi.me();

        if (!active) return;
        applySession(data);
      } catch {
        if (active) clearSession();
      } finally {
        if (active) setLoading(false);
      }
    };

    bootstrap();

    const handleExpired = () => clearSession();
    window.addEventListener("yh:session-expired", handleExpired);

    return () => {
      active = false;
      window.removeEventListener("yh:session-expired", handleExpired);
    };
  }, [applySession, clearSession]);

  const login = useCallback(
    async (email, password) => {
      try {
        const data = await authApi.login(email, password);
        applySession(data);
        return data;
      } catch (error) {
        throw new Error(apiErrorMessage(error));
      }
    },
    [applySession],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      // Si la sesión ya expiró, igual limpiamos el estado local.
      console.warn("Logout del backend:", apiErrorMessage(error));
    }

    clearSession();
  }, [clearSession]);

  const value = useMemo(
    () => ({
      // `session` se mantiene por compatibilidad con App.jsx.
      session: user ? { user } : null,
      user,
      profile,
      role,
      loading,
      login,
      logout,
      reloadProfile: loadProfile,
    }),
    [user, profile, role, loading, login, logout, loadProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
