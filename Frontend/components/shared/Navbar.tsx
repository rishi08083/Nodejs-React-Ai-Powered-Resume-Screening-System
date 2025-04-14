"use client";
import { Menu, UserRound, LogOut, Settings } from "lucide-react";
import ThemeToggle from "../theme/ThemeToggle";
import { useState } from "react";
import { useAuth } from "../../lib/auth";
import LogOutModal from "./LogOut";
import { useRouter } from "next/navigation";
import styles from "../../styles/Navbar.module.css";

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

  return (
    <header className={styles.navbar}>
      <div className={styles.navbarContent}>
        <button
          data-menu-button
          className={styles.menuButton}
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          aria-label="Toggle menu"
        >
          <Menu size={24} />
        </button>

        <div className={styles.welcomeInfo}>
          <h1 className={styles.userName}>Welcome, {user?.name || "User"}</h1>
          <p className={styles.userRole}>
            {user?.role === "admin" ? "Admin" : "Recruiter"}
          </p>
        </div>
      </div>

      <div className={styles.userActions}>
        <UserRound
          className={`${styles.userIcon} cursor-pointer`}
          onClick={() => setModalVisible((prev) => !prev)}
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
