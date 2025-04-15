import React from "react";
import "./globals.css";
import { ReactNode } from "react";
import { AuthProvider } from "../lib/auth";
import { ThemeProvider } from "../lib/themeContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body>
        <ThemeProvider>
          <ToastContainer />
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
