"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/auth";
import { useState, useEffect } from "react";
import styles from "../../styles/Layout.module.css";

export default function Dashboard() {
  const navigate = useRouter();
  const { user, loading } = useAuth();
  useEffect(() => {
    if (!loading) {
      if (user != null) {
        if (user.role === "admin") {
          navigate.push("/dashboard/admin");
        } else {
          navigate.push("/dashboard/recruiter");
        }
      } else {
        return;
      }
    } else {
      return;
    }
  }, [loading, user, navigate]);

  return (
    <div>
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
      </div>
    </div>
  );
}
