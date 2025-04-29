"use client";

import { useState, ChangeEvent, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../../../lib/auth";
import toastService from "../../../utils/toastService";
import { useToastInit } from "../../../hooks/useToastInit";
import GoogleSignIn from "../../../components/auth/GoogleAuth";
import ThemeToggle from "../../../components/theme/ThemeToggle";

function LoginContent() {
  useToastInit();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isFocused, setIsFocused] = useState({ email: false, password: false });
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, checkAuth } = useAuth();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const redirectPath = searchParams.get("redirect") || "/dashboard";
      await login({ email, password });
      router.push(redirectPath);
    } catch (err: any) {
      toastService.error(err.message || "Login failed");
      setIsOpen(true);
      setTimeout(() => {
        setIsOpen(false);
      }, 5000);
    }
  };

  const onClose = () => {
    setIsOpen(false);
  };

  return (
    // 1. Fixed height container to prevent scrolling
    <div className="flex h-screen bg-[var(--surface)] font-sans relative overflow-hidden">
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      {/* 2. Make sure left panel doesn't overflow */}
      <div className="hidden lg:flex lg:w-1/2 bg-[var(--dark-surface)] items-center justify-center flex-col pt-4 pl-7 overflow-hidden">
        {/* 3. Constrain image size responsively */}
        <div className="relative w-full max-w-md flex-shrink-0">
          <Image
            src="/freelancer.svg"
            width={500}
            height={500}
            alt="Welcome"
            className="object-contain"
            priority
          />
        </div>
        <div className="max-w-md text-center px-4">
          <p className="text-[var(--dark-text-secondary)] text-lg font-bold">
            Sign in to access your dashboard and manage your recruitment tasks.
          </p>
        </div>
      </div>

      {/* 4. Make this side scrollable if needed, but container fixed */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 md:p-8 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* 5. Optimize card sizing */}
          <div className="bg-[var(--surface)] p-6 md:p-8 rounded-xl shadow-lg border border-[var(--border)]">
            <div className="flex justify-center mb-6">
              <div className="w-32 h-12 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-[var(--accent)]"></span>
                </div>
              </div>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-center text-[var(--text-primary)] mb-6">
              Sign In
            </h1>

            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div className="mb-5 relative">
                <label
                  htmlFor="email"
                  className={`absolute left-3 transition-all duration-300 pointer-events-none ${
                    isFocused.email || email
                      ? "-top-2.5 text-xs font-medium text-[var(--accent)] bg-[var(--surface)] px-1"
                      : "top-3 text-[var(--text-secondary)]"
                  }`}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none bg-[var(--surface)] text-[var(--text-primary)] transition-colors"
                  style={{
                    borderColor: isFocused.email
                      ? "var(--accent)"
                      : "var(--border)",
                  }}
                  value={email}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setEmail(e.target.value)
                  }
                  onFocus={() =>
                    setIsFocused((prev) => ({ ...prev, email: true }))
                  }
                  onBlur={() =>
                    setIsFocused((prev) => ({ ...prev, email: false }))
                  }
                  required
                />
              </div>

              {/* Password */}
              <div className="mb-5 relative">
                <label
                  htmlFor="password"
                  className={`absolute left-3 transition-all duration-300 pointer-events-none ${
                    isFocused.password || password
                      ? "-top-2.5 text-xs font-medium text-[var(--accent)] bg-[var(--surface)] px-1"
                      : "top-3 text-[var(--text-secondary)]"
                  }`}
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none bg-[var(--surface)] text-[var(--text-primary)] transition-colors"
                  style={{
                    borderColor: isFocused.password
                      ? "var(--accent)"
                      : "var(--border)",
                  }}
                  value={password}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setPassword(e.target.value)
                  }
                  onFocus={() =>
                    setIsFocused((prev) => ({ ...prev, password: true }))
                  }
                  onBlur={() =>
                    setIsFocused((prev) => ({ ...prev, password: false }))
                  }
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[var(--accent)] text-[var(--dark-bg)] font-medium py-3 rounded-lg hover:bg-[var(--accent-hover)] transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg mb-5"
              >
                Sign In
              </button>

              {/* Google Login */}
              <div className="mb-5 w-full">
                <div className="flex justify-center">
                  <div className="w-full max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
                    <GoogleSignIn
                      mode="login"
                      onSuccess={async () => {
                        await checkAuth();
                        router.push("/dashboard");
                      }}
                      onError={(err) =>
                        toastService.error(err || "Google login failed")
                      }
                    />
                  </div>
                </div>
              </div>
            </form>

            <div className="mt-4 flex flex-col items-center space-y-3">
              <Link
                href="/forgetpassword"
                className="text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors duration-300"
              >
                Forgot your password?
              </Link>

              <div className="w-full border-t border-[var(--border)] my-1"></div>

              <p className="text-[var(--text-secondary)]">
                Don't have an account?
              </p>

              <Link
                href="/register"
                className="w-full bg-transparent border-2 border-[var(--accent)] text-[var(--accent)] font-medium py-2.5 rounded-lg text-center hover:bg-[var(--accent-hover)] hover:text-black hover:bg-opacity-10 transition-colors duration-300"
              >
                Recruiter Registration
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ✅ Final export wrapped with Suspense
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent)]"></div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
