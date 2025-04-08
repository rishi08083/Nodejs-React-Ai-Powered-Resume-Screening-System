"use client";
import { LogOut } from "lucide-react";
import React from "react";
export default function LogOutModal({
  setIsLogoutModalOpen,
  logout,
  navigate,
}) {
  return (
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
            onClick={async () => {
              await logout();
              navigate.push("/login");
              setIsLogoutModalOpen(false);
            }}
            className="logout-confirm-button"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
