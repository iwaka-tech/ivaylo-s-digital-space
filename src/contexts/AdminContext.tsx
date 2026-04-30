import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AdminContextValue {
  token: string | null;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

const AdminContext = createContext<AdminContextValue | undefined>(undefined);

const STORAGE_KEY = "iv4o_admin_token";

export function AdminProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
  });

  // Validate expiration on mount
  useEffect(() => {
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        localStorage.removeItem(STORAGE_KEY);
        setToken(null);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      setToken(null);
    }
  }, [token]);

  const login = useCallback(async (username: string, password: string) => {
    const { data, error } = await supabase.functions.invoke("admin-login", {
      body: { username, password },
    });
    if (error) return { ok: false, error: error.message };
    if (data?.error) return { ok: false, error: data.error };
    if (data?.token) {
      localStorage.setItem(STORAGE_KEY, data.token);
      setToken(data.token);
      return { ok: true };
    }
    return { ok: false, error: "Неизвестна грешка" };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
  }, []);

  const value = useMemo(() => ({ token, isAdmin: !!token, login, logout }), [token, login, logout]);
  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used inside AdminProvider");
  return ctx;
}
