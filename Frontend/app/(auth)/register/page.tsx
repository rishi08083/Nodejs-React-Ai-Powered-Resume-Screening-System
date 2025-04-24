"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { fetchRecruiterRegister } from "../../../api-services/recruiterService";
import toastService from "../../../utils/toastService";
import { useToastInit } from "../../../hooks/useToastInit";

import GoogleSignIn from "../../../components/auth/GoogleAuth";
import ThemeToggle from "../../../components/theme/ThemeToggle";
import Image from "next/image";
interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RecruiterRegister() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState<string[] | null>(null);
  const [isError, setIsError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isFocused, setIsFocused] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  });
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setMessage(["Passwords do not match!"]);
      toastService.error("Passwords do not match!");
      setIsError(true);
      setIsOpen(true);
      setTimeout(() => {
        setIsOpen(false);
      }, 5000);
      return;
    }

    try {
      const response = await fetchRecruiterRegister(formData);

      if (response?.status === "success") {
        setMessage([response.message || "Recruiter Request successful!"]);
        toastService.success(response.message || "Recruiter Request successful!");
        setIsError(false);
        setIsOpen(true);
        setTimeout(() => {
          localStorage.setItem("recruiterEmail", formData.email);
          router.push("/register-verification");
        }, 2000);
      } else {
        const errorMessages = handleErrors(response?.error?.details);
        setMessage(
          errorMessages || [response?.message || "An error occurred."]
        );
        toastService.error(errorMessages || response?.message || "An error occurred");
        setIsError(true);
        setIsOpen(true);
        setTimeout(() => {
          setIsOpen(false);
        }, 5000);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage(["An unexpected error occurred. Please try again."]);
      toastService.error("An unexpected error occurred. Please try again.");
      setIsError(true);
      setIsOpen(true);
      setTimeout(() => {
        setIsOpen(false);
      }, 5000);
    }
  };

  const handleErrors = (errors: { msg: string }[] | undefined): string[] => {
    if (Array.isArray(errors) && errors.length > 0) {
      return errors.map((error) => {
        toastService.error(error.msg);
        return error.msg;
      });
    }
    return ["An unknown error occurred."];
  };

  const onClose = () => {
    setIsOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-[var(--surface)] font-sans relative">

      {/* Theme Toggle in top right corner */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      {/* Left side decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[var(--dark-surface)] items-center justify-center">
        <div className="max-w-md text-center">
          <Image
            src="/freelancer3.svg"
            width={600}
            height={600}
            alt="Welcome"
          />
          <p className="text-[var(--dark-text-secondary)] text-lg font-bold">
            Register as a recruiter to access powerful hiring tools and find the
            best talent for your organization.
          </p>
          <div className="mt-12"></div>
        </div>
      </div>

      {/* Right side registration form */}
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
              Recruiter Registration
            </h1>

            <form onSubmit={handleSubmit}>
              <div className="mb-6 relative">
                <label
                  htmlFor="name"
                  className={`absolute left-3 transition-all duration-300 pointer-events-none ${
                    isFocused.name || formData.name
                      ? "-top-2.5 text-xs font-medium text-[var(--accent)] bg-[var(--surface)] px-1"
                      : "top-3 text-[var(--text-secondary)]"
                  }`}
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors duration-300 ease-in-out bg-[var(--surface)] text-[var(--text-primary)]"
                  style={{
                    borderColor: isFocused.name
                      ? "var(--accent)"
                      : "var(--border)",
                  }}
                  value={formData.name}
                  onChange={handleChange}
                  onFocus={() =>
                    setIsFocused((prev) => ({ ...prev, name: true }))
                  }
                  onBlur={() =>
                    setIsFocused((prev) => ({ ...prev, name: false }))
                  }
                  required
                />
              </div>

              <div className="mb-6 relative">
                <label
                  htmlFor="email"
                  className={`absolute left-3 transition-all duration-300 pointer-events-none ${
                    isFocused.email || formData.email
                      ? "-top-2.5 text-xs font-medium text-[var(--accent)] bg-[var(--surface)] px-1"
                      : "top-3 text-[var(--text-secondary)]"
                  }`}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors duration-300 ease-in-out bg-[var(--surface)] text-[var(--text-primary)]"
                  style={{
                    borderColor: isFocused.email
                      ? "var(--accent)"
                      : "var(--border)",
                  }}
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() =>
                    setIsFocused((prev) => ({ ...prev, email: true }))
                  }
                  onBlur={() =>
                    setIsFocused((prev) => ({ ...prev, email: false }))
                  }
                  required
                />
              </div>

              <div className="mb-6 relative">
                <label
                  htmlFor="password"
                  className={`absolute left-3 transition-all duration-300 pointer-events-none ${
                    isFocused.password || formData.password
                      ? "-top-2.5 text-xs font-medium text-[var(--accent)] bg-[var(--surface)] px-1"
                      : "top-3 text-[var(--text-secondary)]"
                  }`}
                >
                  Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors duration-300 ease-in-out bg-[var(--surface)] text-[var(--text-primary)]"
                  style={{
                    borderColor: isFocused.password
                      ? "var(--accent)"
                      : "var(--border)",
                  }}
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() =>
                    setIsFocused((prev) => ({ ...prev, password: true }))
                  }
                  onBlur={() =>
                    setIsFocused((prev) => ({ ...prev, password: false }))
                  }
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus:outline-none"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <div className="mb-6 relative">
                <label
                  htmlFor="confirmPassword"
                  className={`absolute left-3 transition-all duration-300 pointer-events-none ${
                    isFocused.confirmPassword || formData.confirmPassword
                      ? "-top-2.5 text-xs font-medium text-[var(--accent)] bg-[var(--surface)] px-1"
                      : "top-3 text-[var(--text-secondary)]"
                  }`}
                >
                  Confirm Password
                </label>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors duration-300 ease-in-out bg-[var(--surface)] text-[var(--text-primary)]"
                  style={{
                    borderColor: isFocused.confirmPassword
                      ? "var(--accent)"
                      : "var(--border)",
                  }}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onFocus={() =>
                    setIsFocused((prev) => ({ ...prev, confirmPassword: true }))
                  }
                  onBlur={() =>
                    setIsFocused((prev) => ({
                      ...prev,
                      confirmPassword: false,
                    }))
                  }
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus:outline-none"
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>

              <button
                type="submit"
                className="w-full bg-[var(--accent)] text-[var(--dark-bg)] font-medium py-3 rounded-lg hover:bg-[var(--accent-hover)] transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg mb-6"
              >
                Register
              </button>
              <GoogleSignIn
                mode="register"
                onSuccess={() => {
                  toastService.success(
                    "Recruiter request sent successfully. Awaiting admin approval."
                  );
                  localStorage.setItem("recruiterEmail", formData.email);
                  setTimeout(() => {
                    router.push("/dashboard");
                  }, 2000);
                }}
                onError={() => {}} 
              />
            </form>

            <div className="mt-6 flex flex-col items-center space-y-4">
              <div className="w-full border-t border-[var(--border)] my-2"></div>
              <p className="text-[var(--text-secondary)]">
                Already have an account?
              </p>
              <Link
                href="/login"
                className="w-full bg-transparent border-2 border-[var(--accent)] text-[var(--accent)] font-medium py-2.5 rounded-lg text-center hover:bg-[var(--accent-hover)] hover:text-[var(--bg)] hover:bg-opacity-10 transition-colors duration-300"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
