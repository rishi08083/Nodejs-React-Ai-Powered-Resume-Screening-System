"use client";

import { useReducer, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/auth";

import styles from "../styles/NavBar.module.css";

const actionTypes = {
  SET_ACTIVE_SECTION: "SET_ACTIVE_SECTION",
} as const;

type Action = { type: typeof actionTypes.SET_ACTIVE_SECTION; payload: string };

type State = {
  activeSection: string;
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case actionTypes.SET_ACTIVE_SECTION:
      return { ...state, activeSection: action.payload };
    default:
      return state;
  }
};

const initialState: State = { activeSection: "jobs" };

const Home = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { user,  loading } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

 
  useEffect(() => {
    if (user == null && !loading) {
      router.push("/login");
      return;
    }
    if (user != null && user.role === "admin") {
      router.push("/dashboard");
    }
    if (user != null && user.role === "recruiter") {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        isSidebarOpen &&
        !target.closest(`.${styles.sidebar}`) &&
        !target.closest(`.${styles.menuButton}`)
      ) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isSidebarOpen]);

  const setActiveSection = (section: string) => {
    dispatch({ type: actionTypes.SET_ACTIVE_SECTION, payload: section });
    setIsSidebarOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--bg)]">
        <div className="flex justify-center items-center h-64">
          <div className="w-12 h-12 rounded-full border-4 border-yellow-400 border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }
};

export default Home;
