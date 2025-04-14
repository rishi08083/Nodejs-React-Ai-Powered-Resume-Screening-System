"use client";
import { LogOut } from "lucide-react";
import React from "react";
import styles from "../../styles/LogOut.module.css";

export default function LogOutModal({
  setIsLogoutModalOpen,
  logout,
  navigate,
}: {
  setIsLogoutModalOpen: (value: boolean) => void;
  logout: () => Promise<void>;
  navigate: any;
}) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>Confirm Logout</h2>
        <p>Are you sure you want to log out?</p>
        <div className={styles.buttons}>
          <button
            onClick={() => setIsLogoutModalOpen(false)}
            className={styles.cancelButton}
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              await logout();
              navigate.push("/login");
              setIsLogoutModalOpen(false);
            }}
            className={styles.confirmButton}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
