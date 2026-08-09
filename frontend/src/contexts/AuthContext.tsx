import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  login as loginApi,
  logout as logoutApi,
  register as registerApi,
  me,
} from "@/api/auth";
import type { User } from "@/types/user";
import type { RegisterRequest } from "@/types/auth";

interface LoginCredentials {
  username: string;
  password: string;
}

interface AuthContextType {
  user: User | null;

  loading: boolean;

  login: (credentials: LoginCredentials) => Promise<User>;

  register: (data: RegisterRequest) => Promise<User>;

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

  const login = async (credentials: LoginCredentials): Promise<User> => {
    const response = await loginApi(credentials);

    localStorage.setItem("token", response.token);

    setUser(response.user);

    return response.user;
  };

  const register = async (data: RegisterRequest): Promise<User> => {
    const response = await registerApi(data);

    localStorage.setItem("token", response.token);

    setUser(response.user);

    return response.user;
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
        register,
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
