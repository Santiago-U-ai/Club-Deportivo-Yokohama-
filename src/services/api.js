import axios from "axios";
import { supabase } from "./supabase";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Interceptor para agregar token de auth
API.interceptors.request.use(async (config) => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
  } catch (error) {
    console.warn("Error getting session for API request:", error);
    // Continúa sin token si hay error
  }
  return config;
});

export const getStudentData = async () => {
  try {
    return await API.get("/alumnos/me");
  } catch (error) {
    if (error.response?.status === 401 || error.response?.status === 404) {
      // fallback al listado para proyectos donde /me no exista o no tenga registro aún
      return await API.get("/alumnos");
    }
    throw error;
  }
};

export const getStudentPayments = async () => {
  try {
    return await API.get("/pagos/me");
  } catch (error) {
    if (error.response?.status === 401 || error.response?.status === 404) {
      return await API.get("/pagos");
    }
    throw error;
  }
};

export default API;
