"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../lib/auth";
import Sidebar from "../../components/shared/Sidebar";
import Navbar from "../../components/shared/Navbar";
import { useRouter } from "next/navigation";
import LogOutModal from "../../components/shared/LogOut";
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const navigate = useRouter();

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    if (user === null) {
      if (loading === false) {
        navigate.push("/login");
      } else {
        return;
      }
    }

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
  }, [isSidebarOpen, user, loading, navigate]);

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
        // <div className="logout-modal-overlay">
        //   <div className="logout-modal">
        //     <h2>Confirm Logout</h2>
        //     <p>Are you sure you want to log out?</p>
        //     <div className="logout-modal-buttons">
        //       <button
        //         onClick={() => setIsLogoutModalOpen(false)}
        //         className="cancel-button"
        //       >
        //         Cancel
        //       </button>
        //       <button
        //         onClick={async () => {
        //           await logout();
        //           navigate.push("/login");
        //           setIsLogoutModalOpen(false);
        //         }}
        //         className="logout-confirm-button"
        //       >
        //         Logout
        //       </button>
        //     </div>
        //   </div>
        // </div>
        <LogOutModal
          setIsLogoutModalOpen={setIsLogoutModalOpen}
          logout={logout}
          navigate={navigate}
        />
      )}

      <Navbar
        user={user}
        setIsSidebarOpen={setIsSidebarOpen}
        isSidebarOpen={isSidebarOpen}
        setIsLogoutModalOpen={setIsLogoutModalOpen}
        isLogOutModal={isLogoutModalOpen}
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
