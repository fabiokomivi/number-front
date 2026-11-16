import { api } from "@/lib/axios";
import { ENDPOINTS } from "@/lib/config";
// The frontend never computes results: it only reads state and sends the player's number.
export const gameService = {
  state: (id) => api.get(ENDPOINTS.game(id)).then((r) => r.data),
  submit: (id, number) => api.post(ENDPOINTS.submit(id), { number }).then((r) => r.data),
  result: (id) => api.get(ENDPOINTS.result(id)).then((r) => r.data),
};
