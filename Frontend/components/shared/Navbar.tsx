"use client";

import { Menu, UserRound, LogOut, Key } from "lucide-react";
import ThemeToggle from "../theme/ThemeToggle";
import { useState } from "react";
import { useAuth } from "../../lib/auth";
import LogOutModal from "./LogOut";
import { useRouter } from "next/navigation";
export default function Navbar({
  user,
  setIsSidebarOpen,
  isSidebarOpen,
  setIsLogoutModalOpen,
  isLogOutModal,
}) {
  const [modalVisible, setModalVisible] = useState(false);
  const { logout } = useAuth();
  const navigate = useRouter();
  return (
    <header className="navbar">
      <div className="navbar-content">
        <button
          className="menu-button"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          aria-label="Toggle menu"
        >
          <Menu size={24} />
        </button>

        <div className="welcome-info">
          <h1 className="user-name">Welcome, {user?.name || "User"}</h1>
          <p className="user-role">
            {user?.role === "admin" ? "Admin" : "Recruiter"}
          </p>
        </div>
      </div>

      <div className="user-actions">
        <UserRound
          className="user-icon  cursor-pointer"
          onClick={() => setModalVisible((modalVisible) => !modalVisible)}
        />

        <ThemeToggle />
      </div>
      {modalVisible && (
        <div className="absolute z-50 top-14 right-4 w-56 bg-[var(--surface)] border border-[var(--border)] rounded-md shadow-lg overflow-hidden transition-all duration-200 ease-out">
          <div className="p-4 border-b border-[var(--border)]">
            <div className="flex items-center gap-2 text-[var(--text-primary)] cursor-pointer">
              <UserRound className="w-4 h-4" />
              <span className="font-medium">User Profile</span>
            </div>
          </div>

          <div className="p-1 space-y-1">
            {/* Change Password Option */}
            <div
              className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-primary)] rounded hover:bg-[var(--accent-hover)] transition-colors duration-150 cursor-pointer"
              onClick={() => {
                // Add your change password handler here
                setModalVisible(false);
              }}
            >
              <Key className="w-4 h-4 text-[var(--text-secondary)]" />
              <span>Change Password</span>
            </div>

            {/* Log Out Option */}
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
