"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {fetchRecruiterRegister} from "../../../api-services/recruiterService"
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
// Define types for form data
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
  //  "apikey":"Niket"
  // Message state with type string
  const [message, setMessage] = useState<string>("");// State to store the message
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
      return;
    }

    try {
      const response = await fetchRecruiterRegister(formData); // Call the API service
      setMessage(
        "Your request has been sent successfully! Please wait for approval."
      );
      setTimeout(() => {
        router.push("/login"); // Redirect to login page after a delay
      }, 3000); // 3-second delay before redirecting
    } catch (error) {
      setMessage("Failed to send your request. Please try again.");
      console.error("Error:", error);
    }
    // Uncomment and configure the API request when ready
    // await fetch(`${BASE_URL}recruiter/register`
    // try {
    //   const response = await fetchRecruiterRegister(formData); 
  //     const response = await fetch(`${BASE_URL}/auth/register`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(formData),
  //     });

  //     const data = await response.json(); // Read response
  //   console.log("Response Data:", data);
  //     if (response.ok) {
  //   setMessage(
  //     "Your request has been sent successfully! Please wait for approval."
  //   );
  //   setTimeout(() => {
  //     router.push("/login"); // Redirect to login page after a delay
  //   }, 3000); // 3-second delay before redirecting
  //     } else {
  //       setMessage("Failed to send your request. Please try again.");
  //     }
  //   } catch (error) {
  //     console.error("Error submitting form:", error);
  //     setMessage("An error occurred. Please try again later.");
  //   }
  };

  return (
    <div className="max-w-md mx-auto mt-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Recruiter Registration
      </h1>
      {message && (
        <div
          className={`mb-4 text-center font-medium ${
            message.includes("successfully") ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-6 rounded-lg shadow-md"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Confirm Password
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-yellow-500 text-white font-medium py-2 px-4 rounded-lg hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
        >
          Send Request
        </button>
        {/* <a
          href="/login"
          className="block text-center w-full  text-black font-medium py-2 px-1 rounded-lg "
        >
          Go to Login
        </a>
         */}
      </form>
    </div>
  );
}
