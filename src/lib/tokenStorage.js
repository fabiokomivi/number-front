// Access token lives in memory. The refresh token should ideally be an HttpOnly cookie
// set by Django (withCredentials). If the backend returns it in the body instead, we keep
// it in localStorage as a fallback: this is NOT fully secure (XSS can read it).
let accessToken = null;
const REFRESH_KEY = "tng_refresh";
const ACCESS_KEY = "tng_access";
const isBrowser = () => typeof window !== "undefined";

export const tokenStorage = {
  getAccess() {
    if (!accessToken && isBrowser()) accessToken = sessionStorage.getItem(ACCESS_KEY);
    return accessToken;
  },
  setAccess(token) {
    accessToken = token;
    if (isBrowser()) token ? sessionStorage.setItem(ACCESS_KEY, token) : sessionStorage.removeItem(ACCESS_KEY);
  },
  getRefresh() {
    return isBrowser() ? localStorage.getItem(REFRESH_KEY) : null;
  },
  setRefresh(token) {
    if (!isBrowser()) return;
    token ? localStorage.setItem(REFRESH_KEY, token) : localStorage.removeItem(REFRESH_KEY);
  },
  clear() {
    this.setAccess(null);
    this.setRefresh(null);
  },
};
