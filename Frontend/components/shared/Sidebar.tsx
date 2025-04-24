"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  FileUp,
  Users,
  LogOut,
  Book,
  UserRound,
  X,
} from "lucide-react";
import { useTheme } from "../../lib/themeContext";

const recruiterLinks = [
  {
    href: "/dashboard/recruiter",
    label: "Dashboard",
    icon: <LayoutDashboard className="sidebar-icon" />,
  },
  {
    href: "/dashboard/recruiter/jobs",
    label: "Jobs",
    icon: <Briefcase className="sidebar-icon" />,
  },
  {
    href: "/dashboard/recruiter/candidates",
    label: "Screened Candidates",
    icon: <Book className="sidebar-icon" />,
  },
];

const adminLinks = [
  {
    href: "/dashboard/admin",
    label: "Dashboard",
    icon: <LayoutDashboard className="sidebar-icon" />,
  },
  {
    href: "/dashboard/admin/recruiter-requests",
    label: "Requested Recruiters",
    icon: <Users className="sidebar-icon" />,
  },
];

export default function Sidebar({
  role,
  isOpen,
  setIsOpen,
  setIsLogoutModalOpen,
}) {
  const links = role === "admin" ? adminLinks : recruiterLinks;
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen(false)}
      />
      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="logo-container">
          {theme === "dark" ? (
            <Image
              src="/promact.png"
              alt="Logo"
              width={190}
              height={60}
              className="inset-0"
            />
          ) : (
            <Image
              src="/logo.jpg"
              alt="Logo"
              width={190}
              height={60}
              className="inset-0"
            />
          )}

          <button className="close-button" onClick={() => setIsOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`sidebar-link ${pathname === link.href ? "active" : ""}`}
              onClick={() => setIsOpen(false)}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
