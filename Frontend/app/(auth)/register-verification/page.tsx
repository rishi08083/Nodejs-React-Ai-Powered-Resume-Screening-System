"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toastService from "../../../utils/toastService";
import { useToastInit } from "../../../hooks/useToastInit";


export default function RegisterVerification() {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Focus next input on digit entry
  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle arrow key and backspace navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalOtp = otp.join("");
    if (finalOtp.length !== 4) {
      toastService.error("Please enter a valid 4-digit OTP.");
      return;
    }

    const email = localStorage.getItem("recruiterEmail");
    if (!email) {
      toastService.error("Email not found. Please register again.");
      router.push("/register");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-token`,
        { email, otp: finalOtp }
      );

      if (response.data.status === "success") {
        toastService.success("OTP Verified Successfully!");
        localStorage.removeItem("recruiterEmail");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        toastService.error(response.data.message || "Invalid OTP.");
      }
    } catch (error: any) {
      toastService.error(error?.response?.data?.message || "Verification failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Autofocus the first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--surface)]">
      <form
        onSubmit={handleSubmit}
        className="bg-[var(--bg)] p-8 rounded-xl shadow-lg w-full max-w-md text-center border border-[var(--border)]"
      >
        <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">
          Enter OTP
        </h2>
        <p className="text-[var(--text-secondary)] mb-6">
          Please enter the 4-digit OTP sent to your email.
        </p>
        <div className="flex justify-center gap-4 mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}              
              className="w-12 h-12 text-xl text-center border-2 rounded-lg outline-none bg-[var(--surface)] text-[var(--text-primary)]"
              style={{
                borderColor: digit ? "var(--accent)" : "var(--border)",
              }}
            />
          ))}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[var(--accent)] text-[var(--dark-bg)] font-medium py-3 rounded-lg hover:bg-[var(--accent-hover)] transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg disabled:opacity-60"
        >
          {isSubmitting ? "Verifying..." : "Verify OTP"}
        </button>
      </form>
    </div>
  );
}