import { api } from "@/lib/axios";
import { ENDPOINTS } from "@/lib/config";
const unwrap = (d) => (Array.isArray(d) ? d : d?.results ?? []);
export const roomService = {
  list: () => api.get(ENDPOINTS.rooms).then((r) => unwrap(r.data)),
  create: (values) => api.post(ENDPOINTS.rooms, values).then((r) => r.data),
  get: (id) => api.get(ENDPOINTS.room(id)).then((r) => r.data),
  join: (id) => api.post(ENDPOINTS.joinRoom(id)).then((r) => r.data),
  joinByCode: (code) => api.post(ENDPOINTS.joinByCode, { code }).then((r) => r.data),
  leave: (id) => api.post(ENDPOINTS.leaveRoom(id)).then((r) => r.data),
  start: (id) => api.post(ENDPOINTS.startRoom(id)).then((r) => r.data),
};
