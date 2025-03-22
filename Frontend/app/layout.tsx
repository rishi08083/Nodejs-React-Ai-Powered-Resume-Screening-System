import React from "react";
import "./globals.css";
import { ReactNode } from "react";
import { AuthProvider } from "../lib/auth";

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
