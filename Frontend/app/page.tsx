// src/app/Home.tsx
"use client";
import { useReducer, useState, useEffect } from "react";
import Image from "next/image";
import ListJobs from "../components/JobList";
import UploadForm from "../components/UploadForm";
import RecruiterRequests from "../components/admin/RecruiterRequests"; // Admin-specific component

// Define action types
const actionTypes = {
  SET_ACTIVE_SECTION: "SET_ACTIVE_SECTION",
} as const;

type Action =
  | { type: typeof actionTypes.SET_ACTIVE_SECTION; payload: string };

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

  useEffect(() => {
    // Simulate fetching the role from an API or authentication context
    const fetchUserRole = async () => {
      // Replace this with actual API call or authentication logic
      const userRole = "admin"; // Change to "recruiter" or "admin" as needed
      // const userRole = "recruiter"; // Change to "recruiter" or "admin" as needed
      
      setRole(userRole as "admin" | "recruiter");
    };

    fetchUserRole();
  }, []);

  const setActiveSection = (section: string) => {
    dispatch({
      type: actionTypes.SET_ACTIVE_SECTION,
      payload: section,
    });
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-black text-white pt-5 flex flex-col items-center rounded-lg">
        <div className="mb-5">
          <Image src="/logo.jpg" alt="Logo" width={280} height={80} />
        </div>
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
      <div className="flex-1 p-5 bg-gray-100 overflow-auto">
        <div className="bg-white p-4 border-b-2 border-gray-300 mb-5">
          <h2>
            {state.activeSection.charAt(0).toUpperCase() +
              state.activeSection.slice(1)}
          </h2>
        </div>
        <div className="bg-white p-5 shadow-lg rounded-lg">
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
