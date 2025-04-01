"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import React from "react";
import Link from "next/link";
import { useAuth } from "../../../lib/auth";
import Image from "next/image";

const Login = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState({
    email: false,
    password: false,
  });
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      let data = await login({ email, password });
      console.log(data);
      router.push("/dashboard");
    } catch (err) {
      console.log(err);
      setError(err.message);
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
    <div className="flex min-h-screen bg-[#0e151f] font-sans">
      {/* Left side decorative panel */}
      <div className="hidden lg:flex lg:w-1/2  bg-[#1b222c]  items-center justify-center">
        <div className="max-w-md text-center">
          <h1 className="text-4xl font-bold text-white mb-6">Welcome Back</h1>
          <p className="text-white text-lg">
            Sign in to access your dashboard and manage your recruitment tasks.
          </p>
          <div className="mt-12"></div>
        </div>
      </div>

      {/* Right side login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div
            className="bg-[#1b222c] p-8 rounded-xl shadow-lg"
            style={{ boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)" }}
          >
            <div className="flex justify-center mb-6">
              <div className="w-32 h-12 relative">
                {/* You can replace this with your actual logo */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-[#ffb300]"></span>
                </div>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-center text-[#ffffff] mb-8">
              Sign In
            </h1>

            {/* Error Alert */}
            <div
              className={`transition-all duration-500 ease-in-out ${
                isOpen
                  ? "opacity-100 max-h-20 mb-6"
                  : "opacity-0 max-h-0 overflow-hidden"
              }`}
            >
              <div className="bg-red-900 bg-opacity-20 border-l-4 border-red-500 p-4 rounded">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="ml-auto text-red-400 hover:text-red-300 focus:outline-none"
                  >
                    <svg
                      className="h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-6 relative">
                <label
                  htmlFor="email"
                  className={`absolute left-3 transition-all duration-300 pointer-events-none ${
                    isFocused.email || email
                      ? "-top-2.5 text-xs font-medium text-[#ffb300] bg-[#1b222c] px-1"
                      : "top-3 text-[#8b949e]"
                  }`}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors duration-300 ease-in-out bg-[#1b222c] text-[#ffffff]"
                  style={{
                    borderColor: isFocused.email ? "#ffb300" : "#30363d",
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
              <div className="mb-6 relative">
                <label
                  htmlFor="password"
                  className={`absolute left-3 transition-all duration-300 pointer-events-none ${
                    isFocused.password || password
                      ? "-top-2.5 text-xs font-medium text-[#ffb300] bg-[#1b222c] px-1"
                      : "top-3 text-[#8b949e]"
                  }`}
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors duration-300 ease-in-out bg-[#1b222c] text-[#ffffff]"
                  style={{
                    borderColor: isFocused.password ? "#ffb300" : "#30363d",
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
                className="w-full bg-[#ffb300] text-[#0e151f] font-medium py-3 rounded-lg hover:bg-[#ffc133] transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
              >
                Sign In
              </button>
            </form>

            <div className="mt-6 flex flex-col items-center space-y-4">
              <Link
                href="/forgetpassword"
                className="text-[#ffb300] hover:text-[#ffc133] transition-colors duration-300"
              >
                Forgot your password?
              </Link>
              <div className="w-full border-t border-[#30363d] my-2"></div>
              <p className="text-[#8b949e]">Don't have an account?</p>
              <Link
                href="/register"
                className="w-full bg-transparent border-2 border-[#ffb300] text-[#ffb300] font-medium py-2.5 rounded-lg text-center  hover:bg-opacity-10 transition-colors duration-300"
              >
                Recruiter Registration
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
