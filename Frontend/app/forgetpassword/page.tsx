"use client";
import React, { useState, useEffect } from "react";

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [currentStep, setCurrentStep] = useState("otp");
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  // OTP input references
  const inputRefs = [
    React.useRef(null),
    React.useRef(null),
    React.useRef(null),
    React.useRef(null),
  ];

  // Check for token in URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const tokenParam = urlParams.get("token");
      if (tokenParam) {
        setCurrentStep("password");
      }
    }
  }, []);

  // Password validation
  useEffect(() => {
    setPasswordValidation({
      length: newPassword.length >= 8,
      uppercase: /[A-Z]/.test(newPassword),
      lowercase: /[a-z]/.test(newPassword),
      number: /[0-9]/.test(newPassword),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
    });
  }, [newPassword]);

  const handleForgetPassword = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/forget-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || "OTP has been sent to your email");
        setCurrentStep("otp");
      } else {
        setMessage(data.message || "Something went wrong");
        setIsError(true);
      }
    } catch (error) {
      setMessage("Failed to connect to server");
      setIsError(true);
    }
  };

  const handleOtpVerification = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);

    const otpValue = otp.join("");

    try {
      // Replace with your actual OTP verification API endpoint
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, otp: otpValue }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage("OTP verified successfully");
        setCurrentStep("password");
      } else {
        setMessage(data.message || "Invalid OTP");
        setIsError(true);
      }
    } catch (error) {
      setMessage("Failed to connect to server");
      setIsError(true);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match");
      setIsError(true);
      return;
    }

    // Check if all password validations pass
    const allValidationsPassed = Object.values(passwordValidation).every(
      (value) => value
    );
    if (!allValidationsPassed) {
      setMessage("Password does not meet all requirements");
      setIsError(true);
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            otp: otp.join(""),
            newPassword,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || "Password reset successfully");
        setIsError(false);
      } else {
        setMessage(data.message || "Something went wrong");
        setIsError(true);
      }
    } catch (error) {
      setMessage("Failed to connect to server");
      setIsError(true);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }

    if (!/^\d*$/.test(value) && value !== "") {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus to next input
    if (value !== "" && index < 3) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === "Backspace" && index > 0 && otp[index] === "") {
      inputRefs[index - 1].current.focus();
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case "email":
        return "Forgot Your Password?";
      case "otp":
        return "Enter Verification Code";
      case "password":
        return "Create New Password";
      default:
        return "";
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case "email":
        return "Enter your email address and we'll send you a verification code.";
      case "otp":
        return "We've sent a 4-digit code to your email. Please enter it below.";
      case "password":
        return "Create a strong password for your account.";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center p-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-8 transition-all duration-300">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {getStepTitle()}
          </h2>
          <p className="text-gray-600">{getStepDescription()}</p>
        </div>

        {message && (
          <div
            className={`p-4 mb-6 rounded-lg flex items-center ${
              isError
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-green-50 text-green-700 border border-green-200"
            }`}
          >
            <span
              className={`mr-2 text-xl ${
                isError ? "text-red-500" : "text-green-500"
              }`}
            >
              {isError ? "⚠️" : "✓"}
            </span>
            {message}
          </div>
        )}

        {currentStep === "email" && (
          <form onSubmit={handleForgetPassword} className="space-y-4">
            <div className="relative">
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-700 block mb-1"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-yellow-400 p-3 rounded-lg font-medium hover:bg-yellow-500 transition-colors text-gray-800 shadow-md hover:shadow-lg"
            >
              Send Verification Code
            </button>
          </form>
        )}

        {currentStep === "otp" && (
          <form onSubmit={handleOtpVerification} className="space-y-6">
            <div className="flex justify-center space-x-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={inputRefs[index]}
                  type="password"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-14 h-14 text-center text-2xl font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  required
                />
              ))}
            </div>
            <div className="text-center text-sm text-gray-600">
              Didn't receive the code?{" "}
              <button
                type="button"
                className="text-yellow-600 font-medium hover:underline"
              >
                Resend
              </button>
            </div>
            <button
              type="submit"
              className="w-full bg-yellow-400 p-3 rounded-lg font-medium hover:bg-yellow-500 transition-colors text-gray-800 shadow-md hover:shadow-lg"
            >
              Verify Code
            </button>
          </form>
        )}

        {currentStep === "password" && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label
                htmlFor="newPassword"
                className="text-sm font-medium text-gray-700 block mb-1"
              >
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Password must have:
              </p>
              <ul className="space-y-1 text-xs">
                <li
                  className={`flex items-center ${
                    passwordValidation.length
                      ? "text-green-600"
                      : "text-gray-500"
                  }`}
                >
                  <span className="mr-1">
                    {passwordValidation.length ? "✓" : "○"}
                  </span>{" "}
                  At least 8 characters
                </li>
                <li
                  className={`flex items-center ${
                    passwordValidation.uppercase
                      ? "text-green-600"
                      : "text-gray-500"
                  }`}
                >
                  <span className="mr-1">
                    {passwordValidation.uppercase ? "✓" : "○"}
                  </span>{" "}
                  One uppercase letter
                </li>
                <li
                  className={`flex items-center ${
                    passwordValidation.lowercase
                      ? "text-green-600"
                      : "text-gray-500"
                  }`}
                >
                  <span className="mr-1">
                    {passwordValidation.lowercase ? "✓" : "○"}
                  </span>{" "}
                  One lowercase letter
                </li>
                <li
                  className={`flex items-center ${
                    passwordValidation.number
                      ? "text-green-600"
                      : "text-gray-500"
                  }`}
                >
                  <span className="mr-1">
                    {passwordValidation.number ? "✓" : "○"}
                  </span>{" "}
                  One number
                </li>
                <li
                  className={`flex items-center ${
                    passwordValidation.special
                      ? "text-green-600"
                      : "text-gray-500"
                  }`}
                >
                  <span className="mr-1">
                    {passwordValidation.special ? "✓" : "○"}
                  </span>{" "}
                  One special character
                </li>
              </ul>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-gray-700 block mb-1"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  Passwords do not match
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-yellow-400 p-3 rounded-lg font-medium hover:bg-yellow-500 transition-colors text-gray-800 shadow-md hover:shadow-lg mt-2"
            >
              Reset Password
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <a
            href="/login"
            className="text-sm text-yellow-600 hover:underline font-medium"
          >
            Back to Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default ForgetPassword;
