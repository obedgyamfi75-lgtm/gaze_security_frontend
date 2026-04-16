"use client";

import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import type { User } from "@/types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; requiresMfa?: boolean; error?: string }>;
  verifyMfa: (code: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // const checkAuth = async () => {
  //   try {
  //     const response = await authApi.me();
  //     if (response.success && response.data) {
  //       setUser(response.data);
  //     } else {
  //       setUser(null);
  //     }
  //   } catch {
  //     setUser(null);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const checkAuth = async () => {
    // check cache first 
    const cached = sessionStorage.getItem("auth_user");
    if (cached) {
      try {
        setUser(JSON.parse(cached));
        setIsLoading(false);
        // Revalidate in background without blocking render 
        authApi.me().then(response => {
          if (response.success && response.data) {
            sessionStorage.setItem("auth_user", JSON.stringify(response.data));
            setUser(response.data);
          } else {
            sessionStorage.removeItem("auth_user");
            setUser(null);
          }
        });
        return; 
      } catch {
        sessionStorage.removeItem("auth_user");
      }
    }

    // no cache - must fetch
    try {
      const response = await authApi.me();
      if (response.success && response.data) {
        sessionStorage.setItem("auth_user", JSON.stringify(response.data));
        setUser(response.data);
      } else {
        sessionStorage.removeItem("auth_user");
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password);

      if (!response.success) {
        return { success: false, error: response.error || "Login failed" };
      }

      if (response.data?.requiresMfa) {
        return { success: true, requiresMfa: true };
      }

      if (response.data?.user) {
        sessionStorage.setItem("auth_user", JSON.stringify(response.data.user));
        setUser(response.data.user);
        return { success: true };
      }

      return { success: false, error: "Invalid response" };
    } catch (error) {
      return { success: false, error: "Network error" };
    }
  };

  const verifyMfa = async (code: string) => {
    try {
      const response = await authApi.verifyMfa(code);

      if (!response.success) {
        return { success: false, error: response.error || "Invalid code" };
      }

      if (response.data?.user) {
        sessionStorage.setItem("auth_user", JSON.stringify(response.data.user));
        setUser(response.data.user);
        return { success: true };
      }

      return { success: false, error: "Invalid response" };
    } catch (error) {
      return { success: false, error: "Network error" };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      sessionStorage.removeItem("auth_user");
      setUser(null);
      router.push("/login");
    }
  };

  const refreshUser = async () => {
    await checkAuth();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        verifyMfa,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// HOC for protected pages
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function ProtectedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push("/login");
      }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
      return (
        <div className="flex h-screen items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      );
    }

    if (!isAuthenticated) {
      return null;
    }

    return <Component {...props} />;
  };
}