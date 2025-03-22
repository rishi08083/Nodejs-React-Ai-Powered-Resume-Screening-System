import React, { useEffect, useState } from "react";

interface ErrorModalProps {
  message: string;
  isOpen: boolean;
  onClose: () => void;
}

const ErrorModal: React.FC<ErrorModalProps> = ({
  message,
  isOpen,
  onClose,
}) => {
  const [animationState, setAnimationState] = useState("initial");

  useEffect(() => {
    if (isOpen) {
      setAnimationState("enter");
      // Auto close after 5 seconds
      const timer = setTimeout(() => {
        setAnimationState("exit");
        setTimeout(onClose, 500);
      }, 5000);

      return () => clearTimeout(timer);
    } else {
      setAnimationState("exit");
    }
  }, [isOpen, onClose]);

  if (!isOpen && animationState === "initial") return null;

  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 w-full max-w-md z-50 px-4 transition-all duration-500 ease-in-out ${
        animationState === "enter"
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-8"
      }`}
    >
      <div className="bg-white border-l-4 border-red-500 rounded-lg shadow-lg overflow-hidden">
        <div className="p-4">
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
              <p className="text-sm font-medium text-gray-800">{message}</p>
            </div>
            <button
              onClick={onClose}
              className="ml-auto bg-transparent text-gray-400 hover:text-gray-600 focus:outline-none"
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
        {/* Animated progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-full bg-red-500 transition-all duration-5000 ease-linear"
            style={{
              width: animationState === "enter" ? "0%" : "100%",
              transitionProperty: "width",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;
