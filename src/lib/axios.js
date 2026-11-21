import axios from "axios";
import { API_BASE_URL, ENDPOINTS } from "./config";
import { tokenStorage } from "./tokenStorage";

const headers = {
  "Content-Type": "application/json"
}

export const api = axios.create({ baseURL: API_BASE_URL, withCredentials: true, headers:headers });
const bare = axios.create({ baseURL: API_BASE_URL, withCredentials: true, headers:headers });

let onSessionExpired = () => {};
export const setSessionExpiredHandler = (fn) => { onSessionExpired = fn; };

api.interceptors.request.use((config) => {
  const token = tokenStorage.getAccess();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Single in-flight refresh shared by all concurrent 401s.
let refreshPromise = null;
export function refreshAccessToken() {
  if (!refreshPromise) {
    const refresh = tokenStorage.getRefresh();
    refreshPromise = bare
      .post(ENDPOINTS.refresh, refresh ? { refresh } : {})
      .then(({ data }) => {
        tokenStorage.setAccess(data.access);
        if (data.refresh) tokenStorage.setRefresh(data.refresh);
        return data.access;
      })
      .finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const isAuthCall = original?.url && [ENDPOINTS.login, ENDPOINTS.refresh].includes(original.url);
    if (error.response?.status === 401 && original && !original._retry && !isAuthCall) {
      original._retry = true;
      try {
        const token = await refreshAccessToken();
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      } catch (e) {
        tokenStorage.clear();
        onSessionExpired();
        return Promise.reject(e);
      }
    }
    return Promise.reject(error);
  },
);

// Turns DRF error payloads into { message, fields }.
export function parseApiError(error) {
  const data = error?.response?.data;
  if (!error?.response) return { message: "Serveur injoignable. Vérifiez votre connexion.", fields: {} };
  if (typeof data === "string") return { message: data, fields: {} };
  const fields = {};
  let message = data?.detail || data?.message || "";
  if (data && typeof data === "object") {
    for (const [k, v] of Object.entries(data)) {
      if (k === "detail" || k === "message") continue;
      const text = Array.isArray(v) ? v.join(" ") : String(v);
      if (k === "non_field_errors") message = text; else fields[k] = text;
    }
  }
  return { message: message || "Une erreur est survenue.", fields };
}
