import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Render (plan gratuito) puede tardar ~40 s en despertar tras estar inactivo,
// por eso el margen es amplio.
const TIMEOUT_MS = 60000;

const raw = axios.create({
  baseURL: API_BASE,
  timeout: TIMEOUT_MS,
  withCredentials: true,
});

const API = axios.create({
  baseURL: API_BASE,
  timeout: TIMEOUT_MS,
  // Envía y recibe las cookies httpOnly de sesión y el token CSRF.
  withCredentials: true,
});

const SAFE_METHODS = new Set(["get", "head", "options"]);

// El token CSRF vive en memoria: el access token nunca toca JavaScript.
let csrfToken = null;
let csrfRequest = null;

const fetchCsrf = async (force = false) => {
  if (csrfToken && !force) return csrfToken;

  if (!csrfRequest) {
    csrfRequest = raw
      .get("/auth/csrf")
      .then((response) => {
        csrfToken = response.data?.csrfToken ?? null;
        return csrfToken;
      })
      .finally(() => {
        csrfRequest = null;
      });
  }

  return csrfRequest;
};

const refreshSession = async (retry = true) => {
  const token = await fetchCsrf();

  try {
    return await raw.post("/auth/refresh", null, {
      headers: { "X-CSRF-Token": token },
    });
  } catch (error) {
    // La cookie CSRF pudo expirar: se pide una nueva y se reintenta una vez.
    if (retry && error?.response?.status === 403) {
      csrfToken = null;
      return refreshSession(false);
    }
    throw error;
  }
};

const isAuthMutation = (url = "") =>
  /\/auth\/(login|signup|refresh|logout)\b/.test(url);

API.interceptors.request.use(async (config) => {
  const method = (config.method || "get").toLowerCase();

  if (!SAFE_METHODS.has(method)) {
    const token = await fetchCsrf();
    config.headers = config.headers || {};
    config.headers["X-CSRF-Token"] = token;
  }

  return config;
});

let refreshPromise = null;

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error;

    if (!response || !config) throw error;

    const url = config.url || "";

    // Token CSRF vencido o cookie perdida: se renueva y se repite la petición.
    const csrfError = /Solicitud no válida/i.test(response.data?.error || "");

    if (response.status === 403 && csrfError && !config._csrfRetry) {
      config._csrfRetry = true;
      csrfToken = null;
      await fetchCsrf(true);
      return API(config);
    }

    // Access token vencido: se renueva con el refresh token httpOnly.
    if (
      response.status === 401 &&
      !config._retry &&
      !isAuthMutation(url)
    ) {
      config._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = refreshSession().finally(() => {
            refreshPromise = null;
          });
        }
        await refreshPromise;
        return API(config);
      } catch {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("yh:session-expired"));
        }
        throw error;
      }
    }

    throw error;
  },
);

/**
 * Extrae un mensaje legible de un error de axios o de red.
 */
export const apiErrorMessage = (error) => {
  if (error?.response?.data?.error) return error.response.data.error;

  const status = error?.response?.status;

  if (status === 502 || status === 503 || status === 504) {
    return "El servidor no respondió a tiempo. Inténtalo de nuevo en unos segundos.";
  }

  if (error?.code === "ECONNABORTED" || /timeout/i.test(error?.message || "")) {
    return "El servidor tardó demasiado en responder. Puede estar despertando; espera unos segundos e inténtalo de nuevo.";
  }

  if (error?.code === "ERR_NETWORK") {
    return "No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.";
  }

  if (status === 401) return "Sesión expirada";

  return error?.message || "Ocurrió un error inesperado";
};

export const authApi = {
  csrf: () => fetchCsrf(true),
  login: (email, password) =>
    API.post("/auth/login", { email, password }).then((res) => res.data),
  me: () => API.get("/auth/me").then((res) => res.data),
  verify: () => API.get("/auth/verify").then((res) => res.data),
  refresh: () => refreshSession().then((res) => res.data),
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
