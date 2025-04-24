"use client";

import Link from "next/link";
import { useAuth } from "../../lib/auth";

export default function UnauthorizedPage() {
  const { user } = useAuth();

  return (
    <div className="bg-[var(--bg)] min-h-screen flex flex-col items-center justify-center text-[var(--text-primary)]">
      <div className="text-center max-w-md mx-auto p-8 bg-[var(--surface)] rounded-xl shadow-md border border-[var(--border)]">
        <div className="bg-red-100 text-red-600 p-3 rounded-full inline-flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        
        <p className="mb-6">
          You don't have the necessary permissions to access this page.
        </p>
        
        {user && (
          <p className="mb-6 text-[var(--text-secondary)]">
            Logged in as: <span className="font-medium">{user.name}</span> ({user.role})
          </p>
        )}
        
        <div className="flex justify-center space-x-4">
          <Link
            href="/"
            className="bg-[var(--accent)] hover:bg-opacity-90 text-white px-4 py-2 rounded-md transition-colors"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
}