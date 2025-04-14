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
import styles from "../../styles/Sidebar.module.css";

const recruiterLinks = [
  {
    href: "/dashboard/recruiter",
    label: "Dashboard",
    icon: <LayoutDashboard className={styles.icon} />,
  },
  {
    href: "/dashboard/recruiter/jobs",
    label: "Jobs",
    icon: <Briefcase className={styles.icon} />,
  },
  {
    href: "/dashboard/recruiter/candidates",
    label: "Candidates",
    icon: <Book className={styles.icon} />,
  },
];

const adminLinks = [
  {
    href: "/dashboard/admin",
    label: "Dashboard",
    icon: <LayoutDashboard className={styles.icon} />,
  },
  {
    href: "/dashboard/admin/recruiter-requests",
    label: "Recruiter Requests",
    icon: <Users className={styles.icon} />,
  },
];

export default function Sidebar({
  role,
  isOpen,
  setIsOpen,
  setIsLogoutModalOpen,
}: {
  role: string;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  setIsLogoutModalOpen: (value: boolean) => void;
}) {
  const links = role === "admin" ? adminLinks : recruiterLinks;
  const pathname = usePathname();
  const { theme } = useTheme();

  return (
    <>
      <div
        className={`${styles.overlay} ${isOpen ? styles.active : ""}`}
        onClick={() => setIsOpen(false)}
      />
      <aside
        data-sidebar
        className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}
      >
        <div className={styles.logoContainer}>
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

          <button
            className={styles.closeButton}
            onClick={() => setIsOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <nav className={styles.nav}>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.link} ${
                pathname === link.href ? styles.active : ""
              }`}
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
