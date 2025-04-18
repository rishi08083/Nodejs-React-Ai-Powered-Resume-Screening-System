"use client";

import { Menu, UserRound, LogOut, Settings, Upload } from "lucide-react";
import ThemeToggle from "../theme/ThemeToggle";
import { FileUp } from "lucide-react";
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
        {user?.role === "recruiter" && (
          <>
            <button
              type="button"
              className="h-10 px-4 py-2 bg-[var(--accent)] text-[var(--dark-bg)] rounded-lg flex items-center justify-center hover:bg-[var(--accent-hover)] transition-all duration-300 disabled:bg-[var(--border)] disabled:cursor-not-allowed disabled:text-[var(--text-secondary)] sm:px-4 sm:py-2 sm:text-sm md:px-6 md:py-2 md:text-base"
              onClick={() => setIsUploadModalOpen(true)}
            >
              <FileUp className="mr-1" />
              <span className="text-sm sm:text-base">Upload Resumes</span>
            </button>
            {isUploadModalOpen && (
              <UploadModal
                closeModal={() => setIsUploadModalOpen(false)}
                setIsUploadModalOpen={setIsUploadModalOpen}
              />
            )}
          </>
        )}

        <div className="relative">
          <UserRound
            className="user-icon cursor-pointer text-[var(--text-primary)] hover:text-[var(--accent)] transition-all"
            onClick={() => setModalVisible((prev) => !prev)}
          />
          {modalVisible && (
            <div className="absolute z-50 top-12 right-0 w-56 bg-[var(--surface)] border border-[var(--border)] rounded-md shadow-lg overflow-hidden transition-all duration-200 ease-out">
              <div className="p-4 border-b border-[var(--border)]">
                <div
                  className="flex items-center gap-2 text-[var(--text-primary)] cursor-pointer"
                  onClick={() => {
                    const route =
                      user?.role === "admin"
                        ? "/dashboard/admin/profile"
                        : "/dashboard/recruiter/profile";
                    navigate.push(route);
                    setModalVisible(false);
                  }}
                >
                  <UserRound className="w-4 h-4" />
                  <span className="font-medium">User Profile</span>
                </div>
              </div>

              <div className="p-1 space-y-1">
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
