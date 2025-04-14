"use client";
import { useEffect, useState } from "react";
import { useAuth } from "../../lib/auth";
import Sidebar from "../../components/shared/Sidebar";
import Navbar from "../../components/shared/Navbar";
import { useRouter } from "next/navigation";
import LogOutModal from "../../components/shared/LogOut";
import styles from "../../styles/Layout.module.css";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const navigate = useRouter();

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
        !target.closest("[data-sidebar]") &&
        !target.closest("[data-menu-button]")
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
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {isLogoutModalOpen && (
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

      <main className={styles.content}>{children}</main>
    </div>
  );
}
