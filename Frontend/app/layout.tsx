// Frontend/app/layout.tsx
import React from "react";
import "./globals.css";
import { ReactNode } from "react";
import { AuthProvider } from "../lib/auth";
import { ThemeProvider } from "../lib/themeContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TokenExpirationHandler from "../components/shared/TokenExpirationHandler";
import { DataProvider } from "../lib/dataContext";

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body>
          <ThemeProvider>
            <ToastContainer 
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="colored"
              style={{ zIndex: 9999 }}
            />
            <DataProvider>
              <AuthProvider>
                <TokenExpirationHandler />
                {children}
              </AuthProvider>
            </DataProvider>
          </ThemeProvider>
      </body>
    </html>
  );
}