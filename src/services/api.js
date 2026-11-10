import axios from "axios";
import { supabase } from "./supabase";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 20000,
});

// Agrega el token de la sesión de Supabase a cada request.
API.interceptors.request.use(async (config) => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
  } catch (error) {
    console.warn("No se pudo obtener la sesión para la API:", error);
  }

  return config;
});

/**
 * Extrae un mensaje legible de un error de axios o de red.
 */
export const apiErrorMessage = (error) => {
  if (error?.response?.data?.error) return error.response.data.error;
  if (error?.code === "ERR_NETWORK") {
    return "No se pudo conectar con el servidor. ¿Está corriendo el backend?";
  }
  return error?.message || "Ocurrió un error inesperado";
};

export const authApi = {
  me: () => API.get("/auth/me").then((res) => res.data),
  verify: () => API.get("/auth/verify").then((res) => res.data),
  logout: () => API.post("/auth/logout").then((res) => res.data),
};

export const alumnosApi = {
  list: (params) => API.get("/alumnos", { params }).then((res) => res.data),
  me: () => API.get("/alumnos/me").then((res) => res.data),
  get: (id) => API.get(`/alumnos/${id}`).then((res) => res.data),
  create: (payload) => API.post("/alumnos", payload).then((res) => res.data),
  update: (id, payload) =>
    API.patch(`/alumnos/${id}`, payload).then((res) => res.data),
  remove: (id) => API.delete(`/alumnos/${id}`).then((res) => res.data),
};

export const pagosApi = {
  list: (params) => API.get("/pagos", { params }).then((res) => res.data),
  me: () => API.get("/pagos/me").then((res) => res.data),
  byAlumno: (alumnoId) =>
    API.get(`/pagos/alumno/${alumnoId}`).then((res) => res.data),
  get: (id) => API.get(`/pagos/${id}`).then((res) => res.data),
  create: (payload) => API.post("/pagos", payload).then((res) => res.data),
  update: (id, payload) =>
    API.patch(`/pagos/${id}`, payload).then((res) => res.data),
  remove: (id) => API.delete(`/pagos/${id}`).then((res) => res.data),
  uploadComprobante: (pagoId, file) => {
    const form = new FormData();
    form.append("comprobante", file);
    return API.post(`/pagos/${pagoId}/comprobante`, form).then(
      (res) => res.data,
    );
  },
  comprobanteUrl: (pagoId) =>
    API.get(`/pagos/${pagoId}/comprobante`).then((res) => res.data),
};

export const dashboardApi = {
  admin: () => API.get("/dashboard").then((res) => res.data),
  me: () => API.get("/dashboard/me").then((res) => res.data),
};

export default API;
