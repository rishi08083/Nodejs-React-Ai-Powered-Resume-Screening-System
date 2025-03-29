"use client";
import {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from "react";

// // api response user: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//       }
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}
interface AuthContextType {
  user: User | null;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;

  checkAuth: () => Promise<void>;
}
const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  console.log("da", BASE_URL);
  async function checkAuth() {
    try {
      const response = await fetch(BASE_URL + "/api/user/getuserdetails", {
        method: "POST",
        credentials: "include",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });

      if (response.ok) {
        const data = await response.json();
        // console.log(data.user);
        setUser(data.data.user);
        setLoading(false);
        console.log(user);
      } else {
        setUser(null);
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
    checkAuth();
  }, []);
  const login = async (credentials: { email: string; password: string }) => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
      credentials: "include",
    });
    //
    //{"error":true,"message":"Too many requests, please try again later"}

    if (!res.ok) {
      const errorData = await res.json();
      if (errorData.status === "error") {
        if (errorData.message === "Invalid credentials") {
          throw new Error(errorData.error.details);
        }
        if (errorData.message === "Validation failed") {
          throw new Error(errorData.error.details[0].msg);
        }
        if (errorData.message === "Internal Server Error") {
          throw new Error("Internal Server Error");
        }
      } else {
        throw new Error(errorData.message || "Some error occurred");
      }
    }

    const data = await res.json();
    localStorage.setItem("token", data.data.token);
    await checkAuth();
    return data;
  };
  const logout = async () => {
    localStorage.removeItem("token");
    await checkAuth();
  };
  return (
    <AuthContext.Provider value={{ user, login, logout, loading, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
