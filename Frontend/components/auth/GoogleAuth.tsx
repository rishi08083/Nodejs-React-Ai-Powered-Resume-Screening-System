"use client";

import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import toastService from "../../utils/toastService";
import { useToastInit } from "../../hooks/useToastInit";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
interface GoogleDecodedToken {
  name: string;
  email: string;
  picture?: string;
  sub: string;
}

interface Props {
  mode?: "login" | "register";
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export default function GoogleSignIn({
  mode = "login",
  onSuccess,
  onError,
}: Props) {
  useToastInit();
  const router = useRouter();

  const handleGoogleSuccess = async (credentialResponse: {
    credential?: string;
  }) => {
    try {
      if (!credentialResponse?.credential) {
        toastService.error("Google login failed: No credentials returned.");
        return;
      }

      const decoded = jwtDecode<GoogleDecodedToken>(
        credentialResponse.credential
      );
      const { name, email } = decoded;

      if (mode === "register") {
        const registerRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google-oauth-register`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email }),
          }
        );

        const registerData = await registerRes.json();

        if (!registerRes.ok) {
          const message = registerData.message?.toLowerCase();
          if (message?.includes("already registered")) {
            toastService.error("Email already registered. Try logging in.");
            setTimeout(() => router.push("/login"), 2000);
          } else {
            toastService.error(registerData.message || "Registration failed.");
          }
          onError?.(registerData.message);
          return;
        }

        onSuccess?.(registerData);
      } else {
        const loginRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google-oauth-login`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          }
        );

        const loginData = await loginRes.json();

        if (loginRes.ok && loginData?.data?.token) {
          localStorage.setItem("token", loginData.data.token);
          toastService.success("Logged in successfully.");
          onSuccess?.(loginData);
          router.push("/dashboard");
        } else {
          onError?.(loginData.message || "Google login failed.");
        }
      }
    } catch (error: any) {
      console.error("⚠️ Google login error:", error);
      toastService.error("Something went wrong during Google authentication.");
      onError?.(error.message || "Google login error");
    }
  };

  const [width, setWidth] = useState<number | undefined>(undefined);

  useEffect(() => {
    // Only access document on the client side
    const parentElement = document.getElementById("parentElement");
    if (parentElement) {
      setWidth(parentElement.offsetWidth);
    }
  }, []);

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
      <GoogleLogin
        type="standard"
        theme="outline"
        size="large"
        width={width}
        text={mode === "login" ? "continue_with" : "signup_with"}
        shape="rectangular"
        onSuccess={handleGoogleSuccess}
        onError={() => {
          toastService.error("Google login failed");
          onError?.("Google login failed");
        }}
        useOneTap
        context={mode === "login" ? "signin" : "signup"}
      />
    </GoogleOAuthProvider>
  );
}
