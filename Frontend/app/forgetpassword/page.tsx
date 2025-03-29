"use client"
import React, { useState } from 'react';

const ForgetPassword = () => {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
  // Get token from URL if present
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tokenParam = urlParams.get('token');
      if (tokenParam) {
        setToken(tokenParam);
        setEmailSent(true); // Show reset password form
      }
    }
  }, []);

  const handleForgetPassword = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/forget-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage(data.message);
        setEmailSent(true);
      } else {
        setMessage(data.message || 'Something went wrong');
        setIsError(true);
      }
    } catch (error) {
      setMessage('Failed to connect to server');
      setIsError(true);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);
    
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match');
      setIsError(true);
      return;
    }
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage(data.message);
      } else {
        setMessage(data.message || 'Something went wrong');
        setIsError(true);
      }
    } catch (error) {
      setMessage('Failed to connect to server');
      setIsError(true);
    }
  };

  return (
    <div className="h-screen bg-gray-100 flex justify-center items-center">
      <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-8">
        {message && (
          <div className={`p-3 mb-4 rounded ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        )}
        
        {!emailSent ? (
          <>
            <h2 className="text-2xl font-semibold text-center text-gray-700 mb-4">Forgot Your Password?</h2>
            <p className="text-gray-600 mb-6 text-center">Enter your email address and we'll send you a link to reset your password.</p>
            <form onSubmit={handleForgetPassword}>
              <input
                type="email"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-300"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button 
                type="submit"
                className="w-full bg-yellow-400 mt-4 h-10 rounded font-medium hover:bg-yellow-500 transition-colors"
              >
                Send Reset Link
              </button>
            </form>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-semibold text-center text-gray-700 mb-4">Reset Your Password</h2>
            <form onSubmit={handleResetPassword}>
              <div className="mb-4">
                <input
                  type="password"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-300"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <input
                  type="password"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-300"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-yellow-400 mt-2 h-10 rounded font-medium hover:bg-yellow-500 transition-colors"
              >
                Reset Password
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgetPassword;