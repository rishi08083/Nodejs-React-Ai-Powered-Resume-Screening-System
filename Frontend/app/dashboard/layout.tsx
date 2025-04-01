"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../lib/auth";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        isSidebarOpen &&
        !target.closest(".sidebar") &&
        !target.closest(".menu-button")
      ) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isSidebarOpen]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {isLogoutModalOpen && (
        <div className="logout-modal-overlay">
          <div className="logout-modal">
            <h2>Confirm Logout</h2>
            <p>Are you sure you want to log out?</p>
            <div className="logout-modal-buttons">
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className="cancel-button"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Add your logout logic here
                  setIsLogoutModalOpen(false);
                }}
                className="logout-confirm-button"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      <Navbar
        user={user}
        setIsSidebarOpen={setIsSidebarOpen}
        isSidebarOpen={isSidebarOpen}
        setIsLogoutModalOpen={setIsLogoutModalOpen}
      />

      <Sidebar
        role={user?.role}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        setIsLogoutModalOpen={setIsLogoutModalOpen}
      />

      <main className="dashboard-content">{children}</main>
    </div>
  );
}
