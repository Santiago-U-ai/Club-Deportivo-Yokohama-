import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { supabase } from "../services/supabase";
import { apiErrorMessage, authApi } from "../services/api";
import { AuthContext } from "./auth-context";

const AUTH_ERRORS = {
  "Invalid login credentials": "Correo o contraseña incorrectos",
  "Email not confirmed":
    "Debes confirmar tu correo antes de iniciar sesión. Revisa tu bandeja de entrada.",
  "User already registered": "Ya existe una cuenta con ese correo",
  "Email rate limit exceeded":
    "Se alcanzó el límite de correos de Supabase. Intenta más tarde o crea el usuario desde el panel de Supabase.",
  "Password should be at least 6 characters":
    "La contraseña debe tener al menos 6 caracteres",
  "Unable to validate email address: invalid format":
    "El correo no tiene un formato válido",
};

const translateAuthError = (message) => AUTH_ERRORS[message] || message;

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    const data = await authApi.me();
    setProfile(data.profile ?? null);
    setRole(data.role ?? null);
    return data;
  }, []);

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      const {
        data: { session: current },
      } = await supabase.auth.getSession();

      if (!active) return;
      setSession(current);

      if (current) {
        try {
          await loadProfile();
        } catch (error) {
          console.error("No se pudo cargar el perfil:", apiErrorMessage(error));
          setProfile(null);
          setRole(null);
        }
      }

      if (active) setLoading(false);
    };

    bootstrap();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);

      if (!nextSession) {
        setProfile(null);
        setRole(null);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const login = useCallback(
    async (email, password) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw new Error(translateAuthError(error.message));

      setSession(data.session);
      return loadProfile();
    },
    [loadProfile],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      // Si el token ya expiró, igual cerramos la sesión local.
      console.warn("Logout del backend:", apiErrorMessage(error));
    }

    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    setRole(null);
  }, []);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      role,
      loading,
      login,
      logout,
      reloadProfile: loadProfile,
    }),
    [session, profile, role, loading, login, logout, loadProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
