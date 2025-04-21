"use client";
import { log } from "console";
import {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from "react";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  checkAuth: () => Promise<void>;
  setUser: (user: User) => void;
  tokenExpired: boolean;
  setTokenExpired: (expired: boolean) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Add this function to check token expiration
const isTokenExpired = (token: string): boolean => {
  try {
    // JWT tokens are in format: header.payload.signature
    const payload = token.split('.')[1];
    const decodedPayload = JSON.parse(atob(payload));
    const expiryTime = decodedPayload.exp * 1000; // Convert to milliseconds
    return Date.now() >= expiryTime;
  } catch (error) {
    console.error("Error decoding token:", error);
    return true; // Assume expired if we can't decode
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [tokenExpired, setTokenExpired] = useState<boolean>(false);
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      // Check if token is expired before making API call
      if (isTokenExpired(token)) {
        localStorage.removeItem("token");
        setTokenExpired(true);
        setUser(null);
        setLoading(false);
        return;
      }

      const res = await fetch(`${BASE_URL}/api/user/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        setUser(data.data.user);
        setTokenExpired(false);
      } else if (res.status === 401) {
        localStorage.removeItem("token");
        setTokenExpired(true);
        setUser(null);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Auth error:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    checkAuth();
  }, []);

  const login = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("token", data.token);
      await checkAuth();
    } else {
      const errorMessage =
        typeof data.error === "string"
          ? data.error
          : data.message || "Login failed";
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, loading, checkAuth, setUser ,tokenExpired, setTokenExpired}} 
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
