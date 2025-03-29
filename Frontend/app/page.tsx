"use client";

import { useReducer, useState, useEffect } from "react";
import Image from "next/image";
import ListJobs from "../components/recruiter/JobList";
import { useRouter } from "next/navigation";
import UploadForm from "../components/recruiter/UploadForm";
import RecruiterRequests from "../components/admin/RecruiterRequests";
import { useAuth } from "../lib/auth";
import {
  LayoutDashboard,
  Briefcase,
  FileUp,
  UserRound,
  Settings,
  Users,
  LogOut,
  Menu,
  X,
} from "lucide-react";
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
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const handleLogout = () => {
    logout();
    setIsLogoutModalOpen(false);
  };
  const LogoutModal = () => (
    <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
        <h2 className="text-xl font-semibold mb-4">Confirm Logout</h2>
        <p className="mb-6 text-gray-600">Are you sure you want to log out?</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => setIsLogoutModalOpen(false)}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
  useEffect(() => {
    if (user == null && !loading) {
      router.push("/login");
      return;
    }
    if (user != null && user.role === "admin") {
      setRole("admin");
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
      {/* Header with improved styling */}
      {isLogoutModalOpen && <LogoutModal />}
      <header className={`${styles.header}`}>
        <div className={`${styles.headerContent}`}>
          <button
            className={`${styles.menuButton} md:hidden`}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label="Toggle menu"
          >
            <Menu />
          </button>
          <div className={`${styles.welcomeInfo}`}>
            <h1 className="text-xl font-semibold text-gray-800">
              Welcome, {user?.name || "User"}
            </h1>
            <p className="text-sm text-gray-500">
              {role === "admin" ? "Admin" : "Recruiter"}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <UserRound className="text-gray-600" />
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="text-sm text-red-500 hover:text-red-700 flex items-center"
          >
            <LogOut className="mr-2" size={18} /> Logout
          </button>
        </div>
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
          <X />
        </button>

        <nav className="space-y-2 mt-4">
          {role === "recruiter" && (
            <>
              <button
                onClick={() => setActiveSection("jobs")}
                className={`w-full text-left p-2 rounded flex items-center ${
                  state.activeSection === "jobs"
                    ? "bg-yellow-100 text-yellow-700 font-semibold"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Briefcase className="mr-3" size={20} /> Jobs
              </button>
              <button
                onClick={() => setActiveSection("upload")}
                className={`w-full text-left p-2 rounded flex items-center ${
                  state.activeSection == "upload"
                    ? "bg-yellow-100 text-yellow-700 font-semibold"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <FileUp className="mr-3" size={20} /> Upload Resume
              </button>
              <button
                onClick={() => setActiveSection("profile")}
                className={`w-full text-left p-2 rounded flex items-center ${
                  state.activeSection == "profile"
                    ? "bg-yellow-100 text-yellow-700 font-semibold"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <UserRound className="mr-3" size={20} /> Profile
              </button>
            </>
          )}
          {role === "admin" && (
            <>
              <button
                onClick={() => setActiveSection("dashboard")}
                className={`w-full text-left p-2 rounded flex items-center ${
                  state.activeSection == "dashboard"
                    ? "bg-yellow-100 text-yellow-700 font-semibold"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <LayoutDashboard className="mr-3" size={20} /> Dashboard
              </button>
              <button
                onClick={() => setActiveSection("recruiterRequests")}
                className={`w-full text-left p-2 rounded flex items-center ${
                  state.activeSection == "recruiterRequests"
                    ? "bg-yellow-100 text-yellow-700 font-semibold"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Users className="mr-3" size={20} /> Recruiter Requests
              </button>
              <button
                onClick={() => setActiveSection("settings")}
                className={`w-full text-left p-2 rounded flex items-center ${
                  state.activeSection == "settings"
                    ? "bg-yellow-100 text-yellow-700 font-semibold"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Settings className="mr-3" size={20} /> Settings
              </button>
            </>
          )}
        </nav>
      </div>

      {/* Main Content */}
      <main className={styles.main}>
        {role == "recruiter" && state.activeSection == "jobs" && <ListJobs />}
        {role == "recruiter" && state.activeSection == "upload" && (
          <UploadForm />
        )}
        {role == "recruiter" && state.activeSection === "post" && (
          <div>Post Jobs Content</div>
        )}
        {role == "recruiter" && state.activeSection == "profile" && (
          <div>Profile Content</div>
        )}
        {role == "admin" && state.activeSection == "dashboard" && (
          <div>Admin Dashboard Content</div>
        )}
        {role == "admin" && state.activeSection == "recruiterRequests" && (
          <RecruiterRequests />
        )}
        {role === "admin" && state.activeSection == "settings" && (
          <div>Settings Content</div>
        )}
      </main>
    </div>
  );
};

export default Home;
