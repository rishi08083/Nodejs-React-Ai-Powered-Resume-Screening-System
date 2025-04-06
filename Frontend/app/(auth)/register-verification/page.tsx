"use client";
import React, { useState, useRef } from "react";

const RegisterVerification = () => {
  const [otp, setOtp] = useState<string[]>(["", "", "", ""]);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const handleOtpChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const value = e.target.value;

    // Only allow numeric input
    if (value && !/^[0-9]$/.test(value)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus to next input if there's a value
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      // Move focus to previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      // Move focus left with arrow key
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      // Move focus right with arrow key
      inputRefs.current[index + 1]?.focus();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[var(--bg)]">
      <h1 className="text-2xl font-bold text-center text-[var(--text-primary)]">
        Verify OTP
      </h1>
      <p className="mt-4 text-lg text-center text-[var(--text-secondary)]">
        Please check your email for the verification code.
      </p>
      <p className="mt-2 text-lg text-center text-[var(--text-secondary)]">
        Enter the code below to verify your email address.
      </p>
      <div className="mt-6">
        {otp.map((data, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            maxLength={1}
            className="w-12 h-12 border border-gray-300 rounded text-center mx-1 focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]"
            value={data}
            onChange={(e) => handleOtpChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            inputMode="numeric"
          />
        ))}
      </div>
      <button className="bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white font-bold py-2 px-4 rounded mt-4">
        Verify
      </button>
    </div>
  );
};

export default RegisterVerification;
