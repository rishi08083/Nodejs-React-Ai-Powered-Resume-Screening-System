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
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export default function GoogleSignIn({ onSuccess, onError }: Props) {
  const router = useRouter();

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const decoded = jwtDecode<GoogleDecodedToken>(
        credentialResponse.credential
      );
      console.log("✅ Decoded Google User:", decoded);

      // Step 1: Try registering the user
      const registerResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google-oauth-register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: decoded.name,
            email: decoded.email,
          }),
        }
      );

      const registerData = await registerResponse.json();

      // Step 2: If already registered, try login
      if (
        registerResponse.ok &&
        registerData.message === "User already registered"
      ) {
        const loginResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google-oauth-login`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: decoded.email }),
          }
        );

        const loginData = await loginResponse.json();
        console.log(loginData);
        if (loginResponse.ok) {
          toast.success("Logged in successfully.");
          localStorage.setItem("token", loginData.data.token);

          // Redirect based on role
          const tokenPayload = jwtDecode<{ role: string }>(
            loginData.data.token
          );
          console.log(loginData.data.token);

          onSuccess?.(loginData);
        } else {
          toast.error(loginData.message || "Login failed.");
          onError?.(loginData.message);
        }
      } else if (registerResponse.ok) {
        toast.success("Registered successfully. Awaiting admin approval.");
        onSuccess?.(registerData);
      } else {
        toast.error(
          registerData.message || "Google OAuth registration failed."
        );
        onError?.(registerData.message);
      }
    } catch (error: any) {
      console.error("⚠️ Google login error:", error);
      toast.error("Something went wrong during Google login.");
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
