"use client";

import { useAuth } from "../lib/auth";
import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: string[];
  fallback?: ReactNode | null;
  redirectTo?: string;
}

export default function RoleGuard({
  children,
  allowedRoles,
  fallback = null,
  redirectTo,
}: RoleGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      // Not authenticated
      router.push("/login");
      return;
    }

    if (
      !loading &&
      user &&
      redirectTo &&
      !allowedRoles.includes(user.role)
    ) {
      // Authenticated but not authorized
      router.push(redirectTo);
    }
  }, [loading, user, redirectTo, router, allowedRoles]);

  if (loading) {
    // You can replace this with a loading spinner
    return <div>Loading...</div>;
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  if (!allowedRoles.includes(user.role)) {
    return fallback;
  }

  return <>{children}</>;
}