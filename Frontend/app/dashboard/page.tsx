"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/auth";
import { useState, useEffect } from "react";

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
      <div className="loading-container">
        <div className="loader"></div>
      </div>
    </div>
  );
}

