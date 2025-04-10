'use client';

import { Suspense } from "react";

// Client component defined below
const LoginWrapper = () => (
  <Suspense fallback={<div>Loading login...</div>}>
    <Login />
  </Suspense>
);

export default function Page() {
  return <LoginWrapper />;
}

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../../../lib/auth";
import { ToastContainer, toast } from "react-toastify";
import GoogleSignIn from "../../../components/auth/GoogleAuth";
import ThemeToggle from "../../../components/theme/ThemeToggle";
import { Suspense } from "react";

// Define the LoginContent component to use useSearchParams
function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isFocused, setIsFocused] = useState({
    email: false,
    password: false,
  });

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
      toast.error(err.message || "Login failed");
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
    <div className="flex min-h-screen bg-[var(--surface)] font-sans relative">
      <ToastContainer theme="dark" />

      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="hidden lg:flex lg:w-1/2 bg-[var(--dark-surface)] items-center justify-center flex-col pt-4 pl-7">
        <Image src="/freelancer.svg" width={600} height={600} alt="Welcome" />
        <div className="max-w-md text-center">
          <p className="text-[var(--dark-text-secondary)] text-lg font-bold font-stretch-ultra-expanded">
            Sign in to access your dashboard and manage your recruitment tasks.
          </p>
          <div className="mt-12"></div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="bg-[var(--surface)] p-8 rounded-xl shadow-lg border border-[var(--border)]">
            <div className="flex justify-center mb-6">
              <div className="w-32 h-12 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-[var(--accent)]"></span>
                </div>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-center text-[var(--text-primary)] mb-8">
              Sign In
            </h1>

            <form onSubmit={handleSubmit}>
              {/* Email */}

              <div className="mb-6 relative">
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
                  className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors duration-300 ease-in-out bg-[var(--surface)] text-[var(--text-primary)]"
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

              <div className="mb-6 relative">
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
                  className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors duration-300 ease-in-out bg-[var(--surface)] text-[var(--text-primary)]"
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
                className="w-full bg-[var(--accent)] text-[var(--dark-bg)] font-medium py-3 rounded-lg hover:bg-[var(--accent-hover)] transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg mb-6"
              >
                Sign In
              </button>

              <div className="mb-6">
                <GoogleSignIn
                  mode="login"
                  onSuccess={async () => {
                    await checkAuth();
                    router.push("/dashboard");
                  }}
                  onError={(err) =>
                    toast.error(err || "Google login failed")
                  }
                />
              </div>

            </form>

            <div className="mt-6 flex flex-col items-center space-y-4">
              <Link
                href="/forgetpassword"
                className="text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors duration-300"
              >
                Forgot your password?
              </Link>

              <div className="w-full border-t border-[var(--border)] my-2"></div>

              <p className="text-[var(--text-secondary)]">
                Don’t have an account?
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

// Wrap the LoginContent component in Suspense for export
export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
