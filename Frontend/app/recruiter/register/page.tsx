"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { fetchRecruiterRegister } from "../../../api-services/recruiterService";

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
  const [showPassword, setShowPassword] = useState(false); // Toggle for password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Toggle for confirm password visibility
  const router = useRouter();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setMessage(["Passwords do not match!"]);
      setIsError(true);
      return;
    }

    try {
      const response = await fetchRecruiterRegister(formData);
      console.log("response =---=", response);

      if (response?.status === "success") {
        setMessage([response.message || "Recruiter Request successful!"]);
        setIsError(false);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        const errorMessages = handleErrors(response?.error?.details);
        setMessage(errorMessages || [response?.message || "An error occurred."]);
        setIsError(true);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage(["An unexpected error occurred. Please try again."]);
      setIsError(true);
    }
  };

  const handleErrors = (errors: { msg: string }[] | undefined): string[] => {
    if (Array.isArray(errors) && errors.length > 0) {
      return errors.map((error) => error.msg);
    }
    return ["An unknown error occurred."];
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Left Section for Desktop View */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-r from-yellow-400 to-yellow-300 items-center justify-center">
        <div className="max-w-md text-center">
          <h1 className="text-4xl font-bold text-white mb-6">
            Welcome to ATS System
          </h1>
          <p className="text-white text-lg">
            Register as a recruiter to access powerful hiring tools and find the
            best talent for your organization.
          </p>
        </div>
      </div>

      {/* Right Section for Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Recruiter Registration
          </h1>

          {/* Alert Message */}
          {message && (
            <div
              className={`mb-4 p-4 rounded ${
                isError
                  ? "bg-red-50 border-l-4 border-red-500 text-red-700"
                  : "bg-green-50 border-l-4 border-green-500 text-green-700"
              }`}
            >
              {Array.isArray(message) ? (
                <ul className="list-disc pl-5">
                  {message.map((msg, index) => (
                    <li key={index}>{msg}</li>
                  ))}
                </ul>
              ) : (
                <p>{message}</p>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-4 relative">
              <label htmlFor="password" className="block text-gray-700">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"} // Toggle input type
                id="password"
                name="password"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)} // Toggle visibility
                className="absolute right-3 top-9 text-gray-600 hover:text-gray-800"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <div className="mb-4 relative">
              <label htmlFor="confirmPassword" className="block text-gray-700">
                Confirm Password
              </label>
              <input
                type={showConfirmPassword ? "text" : "password"} // Toggle input type
                id="confirmPassword"
                name="confirmPassword"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                } // Toggle visibility
                className="absolute right-3 top-9 text-gray-600 hover:text-gray-800"
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-yellow-400 text-white font-medium py-2 rounded-lg hover:bg-yellow-500 transition-all duration-300"
            >
              Register
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-yellow-500 hover:underline font-medium"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
