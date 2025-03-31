"use client";

import { useEffect, useState } from "react";
import {
  fetchRecruiterRequests,
  acceptRecruiterRequest,
  rejectRecruiterRequest,
} from "../../api-services/recruiterService";

export default function RecruiterRequests() {
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(null);

  useEffect(() => {
    // Fetch recruiter requests when the component loads
    const getRequests = async () => {
      setIsLoading(true);
      try {
        const data = await fetchRecruiterRequests();
        setRequests(data.data.users);
      } catch (error) {
        console.error("Error fetching recruiter requests:", error);
        setMessage("Failed to fetch recruiter requests.");
        showAlert();
      } finally {
        setIsLoading(false);
      }
    };
    getRequests();
  }, []);

  const showAlert = () => {
    setIsAlertVisible(true);
    setTimeout(() => {
      setIsAlertVisible(false);
    }, 5000);
  };

  const handleAccept = async (email) => {
    setActionInProgress(email);
    try {
      const response = await acceptRecruiterRequest(email);
      if (response.ok) {
        setMessage("Request accepted successfully!");
        setRequests(requests.filter((req) => req.email !== email));
      } else {
        setMessage("Failed to accept the request.");
      }
      showAlert();
    } catch (error) {
      console.error("Error accepting recruiter request:", error);
      setMessage("An error occurred while accepting the request.");
      showAlert();
    } finally {
      setActionInProgress(null);
    }
  };

  const handleReject = async (email) => {
    setActionInProgress(email);
    try {
      const response = await rejectRecruiterRequest(email);
      if (response.ok) {
        setMessage("Request rejected successfully!");
        setRequests(requests.filter((req) => req.email !== email));
      } else {
        setMessage("Failed to reject the request.");
      }
      showAlert();
    } catch (error) {
      console.error("Error rejecting recruiter request:", error);
      setMessage("An error occurred while rejecting the request.");
      showAlert();
    } finally {
      setActionInProgress(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}

          {/* Alert Message */}
          <div
            className={`transition-all duration-500 ease-in-out overflow-hidden ${
              isAlertVisible
                ? "max-h-20 opacity-100 p-4 border-l-4"
                : "max-h-0 opacity-0"
            } ${
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
              <p
                className={`ml-3 text-sm font-medium ${
                  message.includes("successfully")
                    ? "text-green-700"
                    : "text-red-700"
                }`}
              >
                {message}
              </p>
              <button
                className={`ml-auto ${
                  message.includes("successfully")
                    ? "text-green-500 hover:text-green-700"
                    : "text-red-500 hover:text-red-700"
                }`}
                onClick={() => setIsAlertVisible(false)}
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

          {/* Content */}
          <div className="p-6">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-pulse flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-yellow-200"></div>
                  <div className="mt-4 text-yellow-500">
                    Loading requests...
                  </div>
                </div>
              </div>
            ) : requests.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
                {requests.map((request) => (
                  <div
                    key={request.email}
                    className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden transition-all duration-300 transform hover:shadow-lg hover:scale-102 hover:border-yellow-300"
                  >
                    <div className="p-5">
                      <div className="flex items-center mb-4">
                        <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-500 text-xl font-bold">
                          {request.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-800">
                            {request.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {request.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-2 mt-4">
                        <button
                          onClick={() => handleAccept(request.email)}
                          disabled={actionInProgress === request.email}
                          className={`inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-300 ${
                            actionInProgress === request.email
                              ? "opacity-75 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          {actionInProgress === request.email ? (
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                          ) : (
                            <svg
                              className="-ml-1 mr-2 h-4 w-4"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                          Accept
                        </button>
                        <button
                          onClick={() => handleReject(request.email)}
                          disabled={actionInProgress === request.email}
                          className={`inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-300 ${
                            actionInProgress === request.email
                              ? "opacity-75 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          {actionInProgress === request.email ? (
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                          ) : (
                            <svg
                              className="-ml-1 mr-2 h-4 w-4"
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
                          )}
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 text-yellow-500 mb-4">
                  <svg
                    className="h-8 w-8"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  No Pending Requests
                </h3>
                <p className="mt-2 text-gray-500">
                  There are currently no recruiter requests to review.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
