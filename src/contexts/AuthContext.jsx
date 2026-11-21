import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authService } from "@/features/auth/authService";
import { setSessionExpiredHandler } from "@/lib/axios";
import { tokenStorage } from "@/lib/tokenStorage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | authenticated | anonymous

  const loadUser = useCallback(async () => {
    try {
      if (!tokenStorage.getAccess()) await authService.refreshToken();
      setUser(await authService.getCurrentUser());
      setStatus("authenticated");
    } catch {
      tokenStorage.clear();
      setUser(null);
      setStatus("anonymous");
    }
  }, []);

  useEffect(() => {
    setSessionExpiredHandler(() => { setUser(null); setStatus("anonymous"); });
    loadUser();
  }, [loadUser]);

  const value = useMemo(() => ({
    user, status,
    login: async (values) => { 
      await authService.login(values); 
      await loadUser();
      
    },
    register: (values) => authService.register(values),
    logout: async () => { await authService.logout(); setUser(null); setStatus("anonymous"); },
  }), [user, status, loadUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
