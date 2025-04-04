"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { fetchRecruiterRegister } from "../../../api-services/recruiterService";
import { ToastContainer, toast } from "react-toastify";
import { error } from "console";
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
      toast.error("Passwords do not match!");
      setIsError(true);
      setIsOpen(true);
      setTimeout(() => {
        setIsOpen(false);
      }, 5000);
      return;
    }

    try {
      const response = await fetchRecruiterRegister(formData);
      console.log("response =---=", response);

      if (response?.status === "success") {
        setMessage([response.message || "Recruiter Request successful!"]);
        toast(response.message || "Recruiter Request successful!");
        setIsError(false);
        setIsOpen(true);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        const errorMessages = handleErrors(response?.error?.details);
        setMessage(
          errorMessages || [response?.message || "An error occurred."]
        );
        toast.error(errorMessages || response?.message || "An error occurred");
        setIsError(true);
        setIsOpen(true);
        setTimeout(() => {
          setIsOpen(false);
        }, 5000);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage(["An unexpected error occurred. Please try again."]);
      toast.error("An unexpected error occurred. Please try again.");
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
        toast.error(error.msg);
        return error.msg;
      });
    }
    return ["An unknown error occurred."];
  };

  const onClose = () => {
    setIsOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-[#0e151f] font-sans">
      {/* Left side decorative panel */}
      <ToastContainer theme="dark" />
      <div className="hidden lg:flex lg:w-1/2 bg-[#1b222c] items-center justify-center">
        <div className="max-w-md text-center">
          <h1 className="text-4xl font-bold text-white mb-6">
            Welcome to ATS System
          </h1>
          <p className="text-white text-lg">
            Register as a recruiter to access powerful hiring tools and find the
            best talent for your organization.
          </p>
          <div className="mt-12"></div>
        </div>
      </div>

      {/* Right side registration form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div
            className="bg-[#1b222c] p-8 rounded-xl shadow-lg"
            style={{ boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)" }}
          >
            <div className="flex justify-center mb-6">
              <div className="w-32 h-12 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-[#ffb300]"></span>
                </div>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-center text-[#ffffff] mb-8">
              Recruiter Registration
            </h1>

            {/* Message Alert */}
            {/* <div
              className={`transition-all duration-500 ease-in-out ${
                isOpen && message
                  ? "opacity-100 max-h-40 mb-6"
                  : "opacity-0 max-h-0 overflow-hidden"
              }`}
            >
              <div
                className={`border-l-4 p-4 rounded ${
                  isError
                    ? "bg-red-900 bg-opacity-20 border-red-500"
                    : "bg-green-900 bg-opacity-20 border-green-500"
                }`}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className={`h-5 w-5 ${
                        isError ? "text-red-500" : "text-green-500"
                      }`}
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
                    {Array.isArray(message) ? (
                      <ul className="list-disc pl-5">
                        {message.map((msg, index) => (
                          <li
                            key={index}
                            className={`text-sm list-none ${
                              isError ? "text-red-400" : "text-green-400"
                            }`}
                          >
                            {msg}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p
                        className={`text-sm ${
                          isError ? "text-red-400" : "text-green-400"
                        }`}
                      >
                        {message}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={onClose}
                    className={`ml-auto ${
                      isError
                        ? "text-red-400 hover:text-red-300"
                        : "text-green-400 hover:text-green-300"
                    } focus:outline-none`}
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
            </div> */}

            <form onSubmit={handleSubmit}>
              <div className="mb-6 relative">
                <label
                  htmlFor="name"
                  className={`absolute left-3 transition-all duration-300 pointer-events-none ${
                    isFocused.name || formData.name
                      ? "-top-2.5 text-xs font-medium text-[#ffb300] bg-[#1b222c] px-1"
                      : "top-3 text-[#8b949e]"
                  }`}
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors duration-300 ease-in-out bg-[#1b222c] text-[#ffffff]"
                  style={{
                    borderColor: isFocused.name ? "#ffb300" : "#30363d",
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
                      ? "-top-2.5 text-xs font-medium text-[#ffb300] bg-[#1b222c] px-1"
                      : "top-3 text-[#8b949e]"
                  }`}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors duration-300 ease-in-out bg-[#1b222c] text-[#ffffff]"
                  style={{
                    borderColor: isFocused.email ? "#ffb300" : "#30363d",
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
                      ? "-top-2.5 text-xs font-medium text-[#ffb300] bg-[#1b222c] px-1"
                      : "top-3 text-[#8b949e]"
                  }`}
                >
                  Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors duration-300 ease-in-out bg-[#1b222c] text-[#ffffff]"
                  style={{
                    borderColor: isFocused.password ? "#ffb300" : "#30363d",
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
                  className="absolute right-3 top-3 text-[#8b949e] hover:text-[#ffffff] focus:outline-none"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <div className="mb-6 relative">
                <label
                  htmlFor="confirmPassword"
                  className={`absolute left-3 transition-all duration-300 pointer-events-none ${
                    isFocused.confirmPassword || formData.confirmPassword
                      ? "-top-2.5 text-xs font-medium text-[#ffb300] bg-[#1b222c] px-1"
                      : "top-3 text-[#8b949e]"
                  }`}
                >
                  Confirm Password
                </label>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors duration-300 ease-in-out bg-[#1b222c] text-[#ffffff]"
                  style={{
                    borderColor: isFocused.confirmPassword
                      ? "#ffb300"
                      : "#30363d",
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
                  className="absolute right-3 top-3 text-[#8b949e] hover:text-[#ffffff] focus:outline-none"
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>

              <button
                type="submit"
                className="w-full bg-[#ffb300] text-[#0e151f] font-medium py-3 rounded-lg hover:bg-[#ffc133] transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
              >
                Register
              </button>
            </form>

            <div className="mt-6 flex flex-col items-center space-y-4">
              <div className="w-full border-t border-[#30363d] my-2"></div>
              <p className="text-[#8b949e]">Already have an account?</p>
              <Link
                href="/login"
                className="w-full bg-transparent border-2 border-[#ffb300] text-[#ffb300] font-medium py-2.5 rounded-lg text-center hover:bg-opacity-10 transition-colors duration-300"
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
