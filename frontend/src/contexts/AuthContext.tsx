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
  staffLogin as staffLoginApi,
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

  staffLogin: (credentials: LoginCredentials) => Promise<User>;

  register: (data: RegisterRequest) => Promise<User>;

  logout: () => Promise<void>;

  refreshUser: () => Promise<void>;

  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(
    () => localStorage.getItem("token") !== null,
  );

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

    if (!token) return;

    let active = true;

    const loadUser = async () => {
      try {
        const response = await me();

        if (active) setUser(response.user);
      } catch {
        localStorage.removeItem("token");

        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadUser();

    return () => {
      active = false;
    };
  }, []);

  const login = async (credentials: LoginCredentials): Promise<User> => {
    const response = await loginApi(credentials);

    localStorage.setItem("token", response.token);

    setUser(response.user);

    return response.user;
  };

  const staffLogin = async (
    credentials: LoginCredentials,
  ): Promise<User> => {
    const response = await staffLoginApi(credentials);

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
    } catch {
      // Clear local authentication even if the token has already expired.
    }

    localStorage.removeItem("token");

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,

        login,
        staffLogin,
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

// The provider and hook intentionally share this module.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) throw new Error("useAuth must be used inside AuthProvider");

  return context;
}
