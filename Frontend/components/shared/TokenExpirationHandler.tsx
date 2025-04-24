"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/auth";
import toastService from "../../utils/toastService";
import { useToastInit } from "../../hooks/useToastInit";

import { motion, AnimatePresence } from "framer-motion";
import { LogIn } from "lucide-react";

// Global state to track if session expired dialog is already shown
let isSessionExpiredDialogShown = false;

const TokenExpirationHandler: React.FC = () => {
  useToastInit();
  const { logout } = useAuth();
  const [showDialog, setShowDialog] = useState(false);
  const router = useRouter();

  // Function to handle token expiration
  const handleTokenExpired = () => {
    // Prevent multiple dialogs
    if (isSessionExpiredDialogShown) return;

    isSessionExpiredDialogShown = true;
    logout();
    setShowDialog(true);
    toastService.error(
      "Your session has expired. Please log in again to continue.",
      {
        toastId: "session-expired",
      }
    );
  };

  // Register a global fetch interceptor
  useEffect(() => {
    const originalFetch = window.fetch;

    window.fetch = async function (input, init) {
      const response = await originalFetch(input, init);

      // Check if the response status is 401 Unauthorized
      if (response.status === 401) {
        // Clone the response so we can both read it and return it
        const clonedResponse = response.clone();

        try {
          const data = await clonedResponse.json();
          // Check if the error message indicates token expiration
          if (
            data?.message?.toLowerCase().includes("expired") ||
            data?.message?.toLowerCase().includes("invalid token") ||
            data?.message?.toLowerCase().includes("jwt") ||
            data?.message?.toLowerCase().includes("unauthorized")
          ) {
            handleTokenExpired();
          }
        } catch (error) {
          // If we can't parse JSON, still check for 401
          if (response.status === 401) {
            handleTokenExpired();
          }
        }
      }

      return response;
    };

    // Cleanup function to restore original fetch
    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  const handleLogin = () => {
    isSessionExpiredDialogShown = false;
    setShowDialog(false);
    router.push("/login");
  };

  const handleClose = () => {
    isSessionExpiredDialogShown = false;
    setShowDialog(false);
  };

  return (
    <AnimatePresence>
      {showDialog && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-[var(--surface)] w-full max-w-md p-6 rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-blue-100 mb-5">
                <LogIn size={28} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
                Session Expired
              </h3>
              <p className="text-[var(--text-secondary)] mb-6">
                Your session has expired. Please log in again to continue.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleLogin}
                  className="px-6 py-3 bg-[var(--accent)] text-white rounded-lg font-medium hover:bg-opacity-90 transition-all shadow-md"
                >
                  Log In
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TokenExpirationHandler;
