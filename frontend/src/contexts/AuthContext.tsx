import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { login as loginApi, logout as logoutApi, me } from "@/api/auth";

interface User {
  id: number;
  parishioner_id: string;

  username: string;
  
  first_name: string;

  full_name: string;

  phone: string;

  role: string;
}

interface LoginCredentials {
  username: string;
  password: string;
}

interface AuthContextType {
  user: User | null;

  loading: boolean;

  login: (credentials: LoginCredentials) => Promise<void>;

  logout: () => Promise<void>;

  refreshUser: () => Promise<void>;

  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const response = await me();

      setUser(response.user);
    } catch {
      setUser(null);

      localStorage.removeItem("token");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);

      return;
    }

    refreshUser().finally(() => {
      setLoading(false);
    });
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const response = await loginApi(credentials);

    localStorage.setItem("token", response.token);

    setUser(response.user);
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch {}

    localStorage.removeItem("token");

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,

        login,
        logout,

        refreshUser,

        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) throw new Error("useAuth must be used inside AuthProvider");

  return context;
}
