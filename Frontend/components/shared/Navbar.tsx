"use client";

import {
  Menu,
  UserRound,
  LogOut,
  Settings,
  Upload,
  Bell,
  Search,
} from "lucide-react";
import ThemeToggle from "../theme/ThemeToggle";
import { FileUp } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../lib/auth";
import LogOutModal from "./LogOut";
import { useRouter } from "next/navigation";
import UploadModal from "../../app/dashboard/recruiter/candidates/UploadModal";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

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
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setModalVisible(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="navbar sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-[var(--surface)] shadow-sm border-b border-[var(--border)]">
      {/* Left section */}
      <div className="flex items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="menu-button p-2 rounded-md hover:bg-[var(--surface-lighter)] transition-all text-[var(--text-primary)]"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          aria-label="Toggle menu"
        >
          <Menu size={22} className="transition-transform duration-200" />
        </motion.button>

        <div className="welcome-info hidden sm:block">
          <h1 className="user-name text-base font-semibold text-[var(--text-primary)] leading-tight">
            Welcome, {user?.name || "User"}
          </h1>
          <p className="user-role text-xs text-[var(--text-secondary)]">
            {user?.role === "admin" ? "Administrator" : "Recruiter"}
          </p>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Resume upload button - only for recruiters */}
        {user?.role === "recruiter" && (
          <>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              className="h-9 px-3 md:px-4 bg-[var(--accent)] text-white rounded-lg flex items-center justify-center hover:bg-[var(--accent-hover)] transition-all duration-200 shadow-sm hover:shadow"
              onClick={() => setIsUploadModalOpen(true)}
              title="Upload Resumes"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden md:inline-block text-sm font-medium ml-1 text-white">
                Upload Resumes
              </span>
            </motion.button>

            {isUploadModalOpen && (
              <UploadModal
                closeModal={() => setIsUploadModalOpen(false)}
                setIsUploadModalOpen={setIsUploadModalOpen}
              />
            )}
          </>
        )}

        {/* User profile dropdown */}
        <div className="relative" ref={dropdownRef}>
            <motion.button
            whileTap={{ scale: 0.9 }}
            className="flex items-center gap-2 p-1.5 rounded-full hover:bg-[var(--surface-lighter)] transition-colors"
            onClick={() => setModalVisible(!modalVisible)}
            aria-label="User menu"
            >
            <div className="h-8 w-8 rounded-full border-2 border-[var(--text-primary)] flex items-center justify-center text-[var(--text-primary)] overflow-hidden">
              <UserRound className="w-5 h-5" />
            </div>
            </motion.button>

          <AnimatePresence>
            {modalVisible && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute z-50 top-12 right-0 w-60 bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-lg overflow-hidden"
              >
                <div className="p-4 border-b border-[var(--border)]">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[var(--accent)] flex items-center justify-center text-white">
                      <UserRound className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-medium text-[var(--text-primary)] truncate max-w-[160px]">
                        {user?.name || "User"}
                      </div>
                      <div className="text-xs text-[var(--text-secondary)]">
                        {user?.email || "user@example.com"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-2">
                  <motion.button
                    whileHover={{ x: 2 }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[var(--text-primary)] rounded-md hover:bg-[var(--surface-lighter)] transition-colors"
                    onClick={() => {
                      const route =
                        user?.role === "admin"
                          ? "/dashboard/admin/profile"
                          : "/dashboard/recruiter/profile";
                      navigate.push(route);
                      setModalVisible(false);
                    }}
                  >
                    <UserRound className="w-4 h-4 text-[var(--text-secondary)]" />
                    <span>My Profile</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ x: 2 }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-500 rounded-md hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                    onClick={() => {
                      setIsLogoutModalOpen(true);
                      setModalVisible(false);
                    }}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Theme toggle button */}
        <ThemeToggle />
      </div>

      {/* Logout modal */}
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
