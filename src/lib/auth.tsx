import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "hdsu.admin.token";

type AuthContextValue = {
  isAdmin: boolean;
  adminToken: string | null;
  loginAdmin: (password: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [adminToken, setToken] = useState<string | null>(null);

  useEffect(() => {
    try {
      const t = localStorage.getItem(STORAGE_KEY);
      if (t) setToken(t);
    } catch {
      /* ignore */
    }
  }, []);

  const loginAdmin = useCallback(async (password: string) => {
    try {
      const res = await fetch("/api/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) return false;
      setToken(password);
      try {
        localStorage.setItem(STORAGE_KEY, password);
      } catch {
        /* ignore */
      }
      return true;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAdmin: !!adminToken, adminToken, loginAdmin, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
