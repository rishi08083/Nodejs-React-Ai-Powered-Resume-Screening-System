"use client";

import { Menu, UserRound, LogOut } from "lucide-react";

export default function Navbar({ user, setIsSidebarOpen, isSidebarOpen, setIsLogoutModalOpen }) {
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
          <p className="user-role">{user?.role === "admin" ? "Admin" : "Recruiter"}</p>
        </div>
      </div>
      
      <div className="user-actions">
        <UserRound className="user-icon" />
        <button
          onClick={() => setIsLogoutModalOpen(true)}
          className="logout-button"
        >
          <LogOut className="logout-icon" /> 
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}