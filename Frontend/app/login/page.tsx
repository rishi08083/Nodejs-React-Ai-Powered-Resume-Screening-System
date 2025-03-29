"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import React from "react";
import Link from "next/link";
import { useAuth } from "../../lib/auth";
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
      router.push("/");
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
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-r from-yellow-400 to-yellow-300 items-center justify-center">
        <div className="max-w-md text-center">
          <h1 className="text-4xl font-bold text-white mb-6">Welcome Back</h1>
          <p className="text-white text-lg">
            Sign in to access your dashboard and manage your recruitment tasks.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Sign In</h1>
            <div
              className={`transition-all duration-500 ease-in-out ${isOpen ? "opacity-100 max-h-20 mb-6" : "opacity-0 max-h-0 overflow-hidden"}`}
            >
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                  <button onClick={onClose} className="ml-auto text-red-500 hover:text-red-700 focus:outline-none">
                    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-6 relative">
                <label htmlFor="email" className="absolute left-3 transition-all duration-300 pointer-events-none">Email Address</label>
                <input type="email" id="email" className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none bg-white text-gray-800" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="mb-6 relative">
                <label htmlFor="password" className="absolute left-3 transition-all duration-300 pointer-events-none">Password</label>
                <input type="password" id="password" className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none bg-white text-gray-800" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <button type="submit" className="w-full bg-yellow-400 text-white py-3 rounded-lg">Sign In</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
