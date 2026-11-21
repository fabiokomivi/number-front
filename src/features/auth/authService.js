import { api } from "@/lib/axios";
import { ENDPOINTS } from "@/lib/config";
import { tokenStorage } from "@/lib/tokenStorage";
import { refreshAccessToken } from "@/lib/axios";

export const authService = {
  async register(values) {
    const { data } = await api.post(ENDPOINTS.register, values);
    return data;
  },
  async login(values) {
    const { data } = await api.post(ENDPOINTS.login, values);
    console.log(data)
    tokenStorage.setAccess(data.access);
    if (data.refresh) tokenStorage.setRefresh(data.refresh);
    return data;
  },
  refreshToken: refreshAccessToken,
  async logout() {
    try { await api.post(ENDPOINTS.logout, { refresh: tokenStorage.getRefresh() }); } catch { /* ignore */ }
    tokenStorage.clear();
  },
  async getCurrentUser() {
    const { data } = await api.get(ENDPOINTS.me);
    return data;
  },
};
