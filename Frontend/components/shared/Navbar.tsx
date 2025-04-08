"use client";

import { Menu, UserRound, LogOut } from "lucide-react";
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
          className="user-icon"
          onClick={() => setModalVisible((modalVisible) => !modalVisible)}
        />

        <ThemeToggle />
      </div>
      {modalVisible && (
        <div className="absolute z-50 top-16 right-2 w-40 p-4 bg-[var(--surface)] rounded-lg  transition-all duration-300 ease-in-out">
          <div className="w-full">Profile</div>
          <div
            className="cursor-pointer"
            onClick={() => {
              setIsLogoutModalOpen(true);
              setModalVisible(false);
            }}
          >
            Log Out
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
