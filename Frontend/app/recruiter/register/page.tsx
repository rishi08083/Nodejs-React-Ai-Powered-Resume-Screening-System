"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import React from "react";
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
  const [message, setMessage] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  });
  const router = useRouter();

  // Handle form input changes
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match!");
      setIsOpen(true);
      setTimeout(() => {
        setIsOpen(false);
      }, 5000);
      return
      
    }
    console.log("outside");
    try {
      const response = await fetchRecruiterRegister(formData); // Call the API service
    
      console.log("response =---=", response);
    
      // Check if the response is OK (status code 200-299)
      if (response.ok) 
        {
        const data = await response.json();
        console.log("data in success", data);
    
        // Assuming the server sends a response with status and message
        if (data.status === "success") {
          setMessage(data.message || "Your request has been sent successfully! Please wait for approval.");
          setIsOpen(true);
          console.log("success");
          
          // Redirect after 3 seconds
          setTimeout(() => {
            router.push("/login");
          }, 3000); // 3-second delay
        } else {
          // Handle case when status is error but response.ok is true
          const errorMessages = handleErrors(data.errors);
        
          setMessage(errorMessages || "An error occurred while processing your request.");
          setIsOpen(true);
          console.log("error in error", data);
        }
      } else {
        // If response isn't OK (e.g., status 400 or 500), process the error response
        // const errorData = await response.json();
        // console.log("errorData", errorData);
    
        // Extract and handle error messages from errorData
        // const errorMessages = handleErrors(errorData.errors);
        // setMessage(errorMessages || "Failed to send your request. Please try again.");
        // setIsOpen(true);
        setMessage( response.errors[0].msg);
          console.log("new ",response.errors[0].msg);
      }
    } catch (error) {
      // Catch network-related errors or unexpected errors
      console.error("Error:", error);
      console.log("error in catch", error);
      
      setMessage("Failed to send your request. Please try again.");
      setIsOpen(true);
    }
    
    // Helper function to process and extract error messages
    function handleErrors(errors) {
      if (Array.isArray(errors)) {
        return errors
          .map((error) => `${error.msg} (Field: ${error.path}, Value: ${error.value})`)
          .join(", ");
      } else {
        return "Unknown error occurred.";
      }
    }
    
    // try {
    //   const response = await fetchRecruiterRegister(formData); // Call the API service

    //   console.log("response",response);
      
    //   // Check if the response is OK (status code 200-299)
    //   if (response.ok) {
    //     const data = await response.json();
    //     console.log("data in success",data);
        

    //     // Assuming the server sends a response with status and message
    //     if (data.status === "success") {
    //       setMessage(data.message || "Your request has been sent successfully! Please wait for approval.");
    //       setIsOpen(true);

    //       // Redirect after 3 seconds
    //       setTimeout(() => {
    //         router.push("/login");
    //       }, 3000); // 3-second delay
    //     } else {
    //       // Handle case when status is error but response.ok is true
    //       setMessage(data.error.msg || "An error occurred while processing your request.");
    //       setIsOpen(true);
    //       console.log("error in error",data);
          
    //     }
    //   } else {
    //     // If response isn't OK (e.g., status 400 or 500), process the error response
    //     const errorData = await response.json();
    //     console.log(errorData);
        
    //     // Set the detailed error message from error.details
    //     setMessage(errorData?.error?.details || errorData?.msg || "Failed to send your request. Please try again.");
    //     setIsOpen(true);
    //     // console.log(errorData);
        
    //   }
    // } catch (error) {
    //   // Catch network-related errors or unexpected errors
    //   console.error("Error:", error);
    //   setMessage("Failed to send your request. Please try again.");
    //   setIsOpen(true);
    // }

  }
  const onClose = () => {
    setIsOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {/* Left side decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-r from-yellow-400 to-yellow-300 items-center justify-center">
        <div className="max-w-md text-center">
          <h1 className="text-4xl font-bold text-white mb-6">
            Join ATS System
          </h1>
          <p className="text-white text-lg">
            Register as a recruiter to access powerful hiring tools and find the
            best talent.
          </p>
          <div className="mt-12"></div>
        </div>
      </div>
      {/* Right side registration form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="flex justify-center mb-6">
              <div className="w-32 h-12 relative">
                {/* You can replace this with your actual logo */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-yellow-500"></span>
                </div>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
              Recruiter Registration
            </h1>

            {/* Alert Message - Success or Error */}
            <div
              className={`transition-all duration-500 ease-in-out ${
                isOpen
                  ? "opacity-100 max-h-20 mb-6"
                  : "opacity-0 max-h-0 overflow-hidden"
              }`}
            >
              <div
                className={`border-l-4 p-4 rounded ${
                  message.includes("successfully")
                    ? "bg-green-50 border-green-500"
                    : "bg-red-50 border-red-500"
                }`}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {message.includes("successfully") ? (
                      <svg
                        className="h-5 w-5 text-green-500"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
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
                    )}
                  </div>
                  <div className="ml-3">
                    <p
                      className={`text-sm ${
                        message.includes("successfully")
                          ? "text-green-700"
                          : "text-red-700"
                      }`}
                    >
                      {message}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className={`ml-auto ${
                      message.includes("successfully")
                        ? "text-green-500 hover:text-green-700"
                        : "text-red-500 hover:text-red-700"
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
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-6 relative">
                <label
                  htmlFor="name"
                  className={`absolute left-3 transition-all duration-300 pointer-events-none ${
                    isFocused.name || formData.name
                      ? "-top-2.5 text-xs font-medium text-yellow-500 bg-white px-1"
                      : "top-3 text-gray-500"
                  }`}
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors duration-300 ease-in-out bg-white text-gray-800"
                  style={{
                    borderColor: isFocused.name ? "#FFD700" : "#E5E7EB",
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
                      ? "-top-2.5 text-xs font-medium text-yellow-500 bg-white px-1"
                      : "top-3 text-gray-500"
                  }`}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors duration-300 ease-in-out bg-white text-gray-800"
                  style={{
                    borderColor: isFocused.email ? "#FFD700" : "#E5E7EB",
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
                      ? "-top-2.5 text-xs font-medium text-yellow-500 bg-white px-1"
                      : "top-3 text-gray-500"
                  }`}
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors duration-300 ease-in-out bg-white text-gray-800"
                  style={{
                    borderColor: isFocused.password ? "#FFD700" : "#E5E7EB",
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
              </div>

              <div className="mb-6 relative">
                <label
                  htmlFor="confirmPassword"
                  className={`absolute left-3 transition-all duration-300 pointer-events-none ${
                    isFocused.confirmPassword || formData.confirmPassword
                      ? "-top-2.5 text-xs font-medium text-yellow-500 bg-white px-1"
                      : "top-3 text-gray-500"
                  }`}
                >
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors duration-300 ease-in-out bg-white text-gray-800"
                  style={{
                    borderColor: isFocused.confirmPassword
                      ? "#FFD700"
                      : "#E5E7EB",
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
              </div>

              <button
                type="submit"
                className="w-full bg-yellow-400 text-white font-medium py-3 rounded-lg hover:bg-yellow-500 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
              >
                Register as Recruiter
              </button>
            </form>

            <div className="mt-6 flex flex-col items-center space-y-4">
              <div className="w-full border-t border-gray-200 my-2"></div>
              <p className="text-gray-600">Already have an account?</p>
              <Link
                href="/login"
                className="w-full bg-white border-2 border-yellow-400 text-yellow-500 font-medium py-2.5 rounded-lg text-center hover:bg-yellow-50 transition-colors duration-300"
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
