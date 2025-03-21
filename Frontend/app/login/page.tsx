"use client";
import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import React from "react";
import Link from "next/link";
import { useAuth } from "../../lib/auth";

const Login = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const router = useRouter();
  const { login } = useAuth();
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await login({ email, password });
      router.push("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-3 rounded-lg shadow hover:shadow-xl flex flex-col justify-center items-center ">
        <h1 className="text-2xl font-bold text-center text-gray-700">Login</h1>
        <form onSubmit={handleSubmit} className="mt-6">
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-600 font-medium">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full px-4 py-2 mt-2 border-gray-300 border-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-gray-600 font-medium  border-gray-300"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full px-4 py-2 mt-2 border-gray-300 border-1  rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <button
            type="submit"
            className="w-full bg-yellow-400 text-white py-2 rounded-lg hover:bg-yellow-600 transition"
          >
            Log In
          </button>
        </form>
        <Link
          href="/forgetpassword"
          className="mt-5 underline text-yellow-400 "
        >
          Forget Password?
        </Link>
        <Link
          href="/recruiter/register"
          className="mt-5 underline text-yellow-400 "
        >
          Recruiter Login
        </Link>
      </div>
    </div>
  );
};

export default Login;
