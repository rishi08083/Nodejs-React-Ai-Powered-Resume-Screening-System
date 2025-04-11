"use client";

import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const decoded = jwtDecode<GoogleDecodedToken>(
        credentialResponse.credential
      );
      const { name, email } = decoded;

      if (mode === "register") {
        // REGISTER MODE
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
            toast.error("Email already registered. Try log in."); // 👈 UPDATE THIS LINE
            setTimeout(() => {
              router.push("/login");
            }, 1000);
          } else {
            toast.error(registerData.message || "Registration failed.");
          }
        
          onError?.(registerData.message);
          return;
        }

        // Success - recruiter registered
        onSuccess?.(registerData);
      } else {
        // LOGIN MODE
        const loginRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google-oauth-login`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          }
        );

        const loginData = await loginRes.json();

        if (loginRes.ok) {
          localStorage.setItem("token", loginData.data.token);
          toast.success("Logged in successfully.");
          onSuccess?.(loginData);
          router.push("/dashboard");
        } else {
          toast.error(loginData.message || "Google login failed.");
          onError?.(loginData.message);
        }
      }
    } catch (error: any) {
      console.error("⚠️ Google login error:", error);
      toast.error("Something went wrong during Google authentication.");
      onError?.(error.message || "Google login error");
    }
  };

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
      <GoogleLogin
        theme="filled_black"
        onSuccess={handleGoogleSuccess}
        onError={() => {
          toast.error("Google login failed");
          onError?.("Google login failed");
        }}
      />
    </GoogleOAuthProvider>
  );
}
