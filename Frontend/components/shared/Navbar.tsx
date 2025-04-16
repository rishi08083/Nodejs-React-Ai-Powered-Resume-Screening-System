"use client";

import { Menu, UserRound, LogOut, Settings } from "lucide-react";
import ThemeToggle from "../theme/ThemeToggle";
import { useEffect, useState } from "react";
import { useAuth } from "../../lib/auth";
import LogOutModal from "./LogOut";
import { useRouter } from "next/navigation";
import UploadModal from "../../app/dashboard/recruiter/candidates/UploadModal";
import "react-toastify/dist/ReactToastify.css"; // Make sure you import the toast styles

export default function Navbar({
  user,
  setIsSidebarOpen,
  isSidebarOpen,
  setIsLogoutModalOpen,
  isLogOutModal,
}: {
  user: any;
  setIsSidebarOpen: (value: boolean) => void;
  isSidebarOpen: boolean;
  setIsLogoutModalOpen: (value: boolean) => void;
  isLogOutModal: boolean;
}) {
  const [modalVisible, setModalVisible] = useState(false);
  const { logout } = useAuth();
  const navigate = useRouter();
  // state for upload modal
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  return (
    <header className="navbar flex items-center justify-between px-4 py-2 bg-[var(--surface)] shadow-md">
      <div className="flex items-center gap-4">
      <button
        className="menu-button p-2 rounded-md hover:bg-[var(--accent-hover)] transition-all"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        aria-label="Toggle menu"
      >
        <Menu size={24} />
      </button>

      <div className="welcome-info">
        <h1 className="user-name text-lg font-semibold text-[var(--text-primary)]">
        Welcome, {user?.name || "User"}
        </h1>
        <p className="user-role text-sm text-[var(--text-secondary)]">
        {user?.role === "admin" ? "Admin" : "Recruiter"}
        </p>
      </div>
      </div>

      <div className="flex items-center gap-4">
      <button
        type="button"
        className="h-10 px-4 py-2 bg-[var(--accent)] text-[var(--dark-bg)] rounded-lg flex items-center hover:bg-[var(--accent-hover)] transition-all duration-300 disabled:bg-[var(--border)] disabled:cursor-not-allowed disabled:text-[var(--text-secondary)]"
        onClick={() => setIsUploadModalOpen(true)}
      >
        <svg
        className="h-5 w-5 mr-2"
        fill="#000000"
        version="1.1"
        id="Capa_1"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 490.955 490.955"
        xmlSpace="preserve"
        >
        <path
          id="XMLID_448_"
          d="M445.767,308.42l-53.374-76.49v-20.656v-11.366V97.241c0-6.669-2.604-12.94-7.318-17.645L312.787,7.301
          C308.073,2.588,301.796,0,295.149,0H77.597C54.161,0,35.103,19.066,35.103,42.494V425.68c0,23.427,19.059,42.494,42.494,42.494
          h159.307h39.714c1.902,2.54,3.915,5,6.232,7.205c10.033,9.593,23.547,15.576,38.501,15.576c26.935,0-1.247,0,34.363,0
          c14.936,0,28.483-5.982,38.517-15.576c11.693-11.159,17.348-25.825,17.348-40.29v-40.06c16.216-3.418,30.114-13.866,37.91-28.811
          C459.151,347.704,457.731,325.554,445.767,308.42z M170.095,414.872H87.422V53.302h175.681v46.752
          c0,16.655,13.547,30.209,30.209,30.209h46.76v66.377h-0.255v0.039c-17.685-0.415-35.529,7.285-46.934,23.46l-61.586,88.28
          c-11.965,17.134-13.387,39.284-3.722,57.799c7.795,14.945,21.692,25.393,37.91,28.811v19.842h-10.29H170.095z M410.316,345.771
          c-2.03,3.866-5.99,6.271-10.337,6.271h-0.016h-32.575v83.048c0,6.437-5.239,11.662-11.659,11.662h-0.017H321.35h-0.017
          c-6.423,0-11.662-5.225-11.662-11.662v-83.048h-32.574h-0.016c-4.346,0-8.308-2.405-10.336-6.271
          c-2.012-3.866-1.725-8.49,0.783-12.07l61.424-88.064c2.189-3.123,5.769-4.984,9.57-4.984h0.017c3.802,0,7.38,1.861,9.568,4.984
          l61.427,88.064C412.04,337.28,412.328,341.905,410.316,345.771z"
        />
        </svg>
        Upload Resume
      </button>

      {isUploadModalOpen && (
        <UploadModal
        closeModal={() => setIsUploadModalOpen(false)}
        setIsUploadModalOpen={setIsUploadModalOpen}
        />
      )}

      <div className="relative">
        <UserRound
        className="user-icon cursor-pointer text-[var(--text-primary)] hover:text-[var(--accent)] transition-all"
        onClick={() => setModalVisible((prev) => !prev)}
        />
        {modalVisible && (
        <div className="absolute z-50 top-12 right-0 w-56 bg-[var(--surface)] border border-[var(--border)] rounded-md shadow-lg overflow-hidden transition-all duration-200 ease-out">
          <div className="p-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2 text-[var(--text-primary)] cursor-pointer">
            <UserRound className="w-4 h-4" />
            <span className="font-medium">User Profile</span>
          </div>
          </div>

          <div className="p-1 space-y-1">
          <div
            className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-primary)] rounded hover:bg-[var(--accent-hover)] transition-colors duration-150 cursor-pointer"
            onClick={() => {
            const route =
              user?.role === "admin"
              ? "/dashboard/admin/profile"
              : "/dashboard/recruiter/profile";
            navigate.push(route);
            setModalVisible(false);
            }}
          >
            <Settings className="w-4 h-4 text-[var(--text-secondary)]" />
            <span>Profile Settings</span>
          </div>

          <div
            className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-primary)] rounded hover:bg-[var(--accent-hover)] transition-colors duration-150 cursor-pointer"
            onClick={() => {
            setIsLogoutModalOpen(true);
            setModalVisible(false);
            }}
          >
            <LogOut className="w-4 h-4 text-[var(--text-secondary)]" />
            <span>Log Out</span>
          </div>
          </div>
        </div>
        )}
      </div>

      <ThemeToggle />
      </div>

      {isLogOutModal && (
      <LogOutModal
        setIsLogoutModalOpen={setIsLogoutModalOpen}
        logout={logout}
        navigate={navigate}
      />
      )}
    </header>
  );
}
