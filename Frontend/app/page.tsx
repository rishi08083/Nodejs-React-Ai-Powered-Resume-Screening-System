"use client";

import { useReducer, useState, useEffect } from "react";
import Image from "next/image";
import ListJobs from "../components/JobList";
import { useRouter } from "next/navigation";
import UploadForm from "../components/UploadForm";
import RecruiterRequests from "../components/admin/RecruiterRequests";
import { useAuth } from "../lib/auth";
import { HiMenu, HiX } from "react-icons/hi";
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
  const [role, setRole] = useState<"admin" | "recruiter">("recruiter");
  const { user, logout, checkAuth, loading } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (user == null) {
      router.push("/login");
      return;
    }
    if (user != null && user.role === "admin") {
      setRole("recruiter");
    }
    if (user != null && user.role === "recruiter") {
      setRole("recruiter");
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
      <div className="flex items-center justify-center h-screen">
        <div className="flex justify-center items-center h-64">
          <div className="w-12 h-12 rounded-full border-4 border-yellow-400 border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header - now visible on all screen sizes */}
      <header className={styles.header}>
        <button
          className={styles.menuButton}
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          aria-label="Toggle menu"
        >
          <HiMenu />
        </button>
        <h1>{user?.name || "Dashboard"}</h1>
        <button onClick={logout} className="ml-auto text-sm">
          Logout
        </button>
      </header>

      {/* Overlay to close sidebar when clicking outside on mobile */}
      <div
        className={`${styles.overlay} ${isSidebarOpen ? styles.active : ""}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar */}
      <div className={`${styles.sidebar} ${isSidebarOpen ? styles.open : ""}`}>
        <div className={styles.logoContainer}>
          <Image src="/logo.jpg" alt="Logo" width={200} height={60} priority />
        </div>

        {/* Close button for mobile sidebar */}
        <button
          className="absolute top-4 right-4 text-gray-500 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        >
          <HiX />
        </button>

        <nav>
          {role === "recruiter" && (
            <>
              <button
                onClick={() => setActiveSection("jobs")}
                className={state.activeSection === "jobs" ? "font-bold" : ""}
              >
                Jobs
              </button>
              <button
                onClick={() => setActiveSection("upload")}
                className={state.activeSection === "upload" ? "font-bold" : ""}
              >
                Upload Resume
              </button>
              <button
                onClick={() => setActiveSection("post")}
                className={state.activeSection === "post" ? "font-bold" : ""}
              >
                Post Jobs
              </button>
              <button
                onClick={() => setActiveSection("profile")}
                className={state.activeSection === "profile" ? "font-bold" : ""}
              >
                Profile
              </button>
            </>
          )}
          {role === "admin" && (
            <>
              <button
                onClick={() => setActiveSection("dashboard")}
                className={
                  state.activeSection === "dashboard" ? "font-bold" : ""
                }
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveSection("recruiterRequests")}
                className={
                  state.activeSection === "recruiterRequests" ? "font-bold" : ""
                }
              >
                Recruiter Requests
              </button>
              <button
                onClick={() => setActiveSection("settings")}
                className={
                  state.activeSection === "settings" ? "font-bold" : ""
                }
              >
                Settings
              </button>
            </>
          )}
          <button onClick={logout} className="mt-4">
            Logout
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <main className={styles.main}>
        {role === "recruiter" && state.activeSection === "jobs" && <ListJobs />}
        {role === "recruiter" && state.activeSection === "upload" && (
          <UploadForm />
        )}
        {role === "recruiter" && state.activeSection === "post" && (
          <div>Post Jobs Content</div>
        )}
        {role === "recruiter" && state.activeSection === "profile" && (
          <div>Profile Content</div>
        )}
        {role === "admin" && state.activeSection === "dashboard" && (
          <div>Admin Dashboard Content</div>
        )}
        {role === "admin" && state.activeSection === "recruiterRequests" && (
          <RecruiterRequests />
        )}
        {role === "admin" && state.activeSection === "settings" && (
          <div>Settings Content</div>
        )}
      </main>
    </div>
  );
};

export default Home;
