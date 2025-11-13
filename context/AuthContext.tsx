"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/api";

interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (token: string, user?: User) => void;
  logout: () => void;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshUser = async () => {
    try {
      const data = await getCurrentUser();
      if (data?.user) {
        setUser(data.user);
      } else {
        setUser(null);
        setToken(null);
      }
    } catch (err) {
      console.error("Failed to refresh user:", err);
      setUser(null);
      setToken(null);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      if (typeof window === "undefined") return;

      const storedToken = localStorage.getItem("token");
      if (!storedToken) {
        setLoading(false);
        return;
      }

      setToken(storedToken);
      
      try {
        const data = await getCurrentUser();
        if (data?.user) {
          setUser(data.user);
        } else {
          // Token is invalid
          localStorage.removeItem("token");
          setUser(null);
          setToken(null);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        localStorage.removeItem("token");
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = (newToken: string, userData?: User) => {
    setToken(newToken);
    setUser(userData || null);
    localStorage.setItem("token", newToken);
    
    // If we don't have user data, fetch it
    if (!userData) {
      refreshUser();
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user"); // Clean up any old user data
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isAdmin: !!user?.isAdmin,
        login,
        logout,
        loading,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
