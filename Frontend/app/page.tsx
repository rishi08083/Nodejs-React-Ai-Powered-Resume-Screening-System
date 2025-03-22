"use client";
import { useReducer, useState, useEffect } from "react";
import Image from "next/image";
import ListJobs from "../components/JobList";
import { useRouter } from "next/navigation";
import UploadForm from "../components/UploadForm";
import RecruiterRequests from "../components/admin/RecruiterRequests"; // Admin-specific component
import { useAuth } from "../lib/auth";
import { HiMenu } from "react-icons/hi"; // For the hamburger icon

// Define action types
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
      return {
        ...state,
        activeSection: action.payload,
      };
    default:
      return state;
  }
};

const initialState: State = {
  activeSection: "jobs", // Default section
};

const Home = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [role, setRole] = useState<"admin" | "recruiter">("recruiter"); // State to track user role
  const { user, logout, checkAuth, loading } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State to manage sidebar toggle

  useEffect(() => {
    // Simulate fetching the role from an API or authentication context
    const fetchUserRole = async () => {
      if (!user) {
        console.log("No user found, redirecting to login.");
        router.push("/login");
        return;
      }
  
      // If there is a user, fetch the role
      setRole(user.role as "admin" | "recruiter");
    };

    fetchUserRole();
  }, [user, loading]);

  const setActiveSection = (section: string) => {
    dispatch({
      type: actionTypes.SET_ACTIVE_SECTION,
      payload: section,
    });
    setIsSidebarOpen(!isSidebarOpen)
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500">
      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? "w-64" : "w-0"
        } md:w-64 bg-black text-white pt-5 flex flex-col items-center rounded-lg transition-all duration-300 ease-in-out`}
      >
        <div className="mb-5">
          <Image src="/logo.jpg" alt="Logo" width={280} height={80} />
        </div>

        {/* Hamburger Icon (visible only on small screens) */}
        
        {role === "recruiter" && (
          <>
            <div
              className={`w-full py-4 text-center cursor-pointer transition-all duration-300 ${
                state.activeSection === "jobs"
                  ? "bg-yellow-400 text-black"
                  : "hover:bg-yellow-400 hover:text-black"
              }`}
              onClick={() => setActiveSection("jobs")}
            >
              Jobs
            </div>
            <div
              className={`w-full py-4 text-center cursor-pointer transition-all duration-300 ${
                state.activeSection === "upload"
                  ? "bg-yellow-400 text-black"
                  : "hover:bg-yellow-400 hover:text-black"
              }`}
              onClick={() => setActiveSection("upload")}
            >
              Upload Resume
            </div>
            <div
              className={`w-full py-4 text-center cursor-pointer transition-all duration-300 ${
                state.activeSection === "post"
                  ? "bg-yellow-400 text-black"
                  : "hover:bg-yellow-400 hover:text-black"
              }`}
              onClick={() => setActiveSection("post")}
            >
              Post Jobs
            </div>
            <div
              className={`w-full py-4 text-center cursor-pointer transition-all duration-300 ${
                state.activeSection === "profile"
                  ? "bg-yellow-400 text-black"
                  : "hover:bg-yellow-400 hover:text-black"
              }`}
              onClick={() => setActiveSection("profile")}
            >
              Profile
            </div>
          </>
        )}
        {role === "admin" && (
          <>
            <div
              className={`w-full py-4 text-center cursor-pointer transition-all duration-300 ${
                state.activeSection === "dashboard"
                  ? "bg-yellow-400 text-black"
                  : "hover:bg-yellow-400 hover:text-black"
              }`}
              onClick={() => setActiveSection("dashboard")}
            >
              Dashboard
            </div>
            <div
              className={`w-full py-4 text-center cursor-pointer transition-all duration-300 ${
                state.activeSection === "recruiterRequests"
                  ? "bg-yellow-400 text-black"
                  : "hover:bg-yellow-400 hover:text-black"
              }`}
              onClick={() => setActiveSection("recruiterRequests")}
            >
              Recruiter Requests
            </div>
            <div
              className={`w-full py-4 text-center cursor-pointer transition-all duration-300 ${
                state.activeSection === "settings"
                  ? "bg-yellow-400 text-black"
                  : "hover:bg-yellow-400 hover:text-black"
              }`}
              onClick={() => setActiveSection("settings")}
            >
              Settings
            </div>
          </>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-5 bg-gray-100 overflow-scroll">
        <div className="bg-white p-4 border-b-2 border-gray-300 mb-5 rounded-lg flex justify-between">
          {/* <h2>
            {state.activeSection.charAt(0).toUpperCase() +
              state.activeSection.slice(1)}
          </h2> */}
          <h1>{user && user.name}</h1>
          <button
          className=" md:hidden text-white text-3xl"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <HiMenu 
          color="black"
          />
        </button> 
 
        </div>
        <div className="bg-white p-5 shadow-lg rounded-lg overflow-scroll ">
          {role === "recruiter" && state.activeSection === "jobs" && (
            <ListJobs />
          )}
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
        </div>
      </div>
    </div>
  );
};

export default Home;
