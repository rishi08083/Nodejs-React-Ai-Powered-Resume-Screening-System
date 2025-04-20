"use client";

import { useAuth } from "../lib/auth";
import { useRouter } from "next/navigation";
import { useEffect, ComponentType } from "react";

export function withRole<P extends object>(
  Component: ComponentType<P>,
  allowedRoles: string[],
  redirectTo: string = "/unauthorized"
) {
  return function ProtectedRoute(props: P) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading) {
        if (!user) {
          router.push("/login");
        } else if (!allowedRoles.includes(user.role)) {
          router.push(redirectTo);
        }
      }
    }, [loading, user, router]);

    if (loading) {
      return (
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent)]"></div>
        </div>
      );
    }

    if (!user || !allowedRoles.includes(user.role)) {
      return null; // Will redirect in the useEffect
    }

    return <Component {...props} />;
  };
}