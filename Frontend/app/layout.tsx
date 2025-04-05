import React from "react";
import "./globals.css";
import { ReactNode } from "react";
import { AuthProvider } from "../lib/auth";
import { ThemeProvider } from "../lib/themeContext";

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
