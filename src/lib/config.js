// Central backend configuration. Never hardcode URLs in components.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
export const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || "ws://localhost:8000/ws";
export const TOTAL_ROUNDS = 5;

// PROVISIONAL endpoints — adapt to the real Django routes (see docs/API.md).
export const ENDPOINTS = {
  register: "/auth/register/",
  login: "/auth/token/",
  refresh: "/auth/token/refresh/",
  logout: "/auth/logout/",
  me: "/auth/me/",
  rooms: "/rooms/",
  joinByCode: "/rooms/join/",
  room: (id) => `/rooms/${id}/`,
  joinRoom: (id) => `/rooms/${id}/join/`,
  leaveRoom: (id) => `/rooms/${id}/leave/`,
  startRoom: (id) => `/rooms/${id}/start/`,
  game: (id) => `/rooms/${id}/game/`,
  submit: (id) => `/rooms/${id}/submit/`,
  result: (id) => `/rooms/${id}/result/`,
  roomSocket: (id) => `/rooms/${id}/`,
};
