"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/auth";
import { useState, useEffect } from "react";

export default function Dashboard() {
  const navigate = useRouter();
  const { user } = useAuth();
  useEffect(() => {
    if (user.role === "admin") {
      navigate.push("/dashboard/admin");
    } else {
      navigate.push("/dashboard/recruiter");
    }
  }, []);

  return (
    <div>
      <div className="loading-container">
        <div className="loader"></div>
      </div>
    </div>
  );
}
