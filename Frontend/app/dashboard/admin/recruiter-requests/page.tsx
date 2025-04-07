"use client";
import { JSX, useEffect, useState } from "react";
import {
  fetchRecruiterRequests,
  acceptRecruiterRequest,
  rejectRecruiterRequest,
} from "../../../../api-services/recruiterService";

interface RecruiterRequest {
  name: string;
  email: string;
}

interface ApiResponse {
  data: {
    users: RecruiterRequest[];
  };
  ok: boolean;
}

export default function RecruiterRequests(): JSX.Element {
  const [requests, setRequests] = useState<RecruiterRequest[]>([]);
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAlertVisible, setIsAlertVisible] = useState<boolean>(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  useEffect(() => {
    const getRequests = async (): Promise<void> => {
      setIsLoading(true);
      try {
        const data = (await fetchRecruiterRequests()) as unknown as ApiResponse;
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

  const showAlert = (): void => {
    setIsAlertVisible(true);
    setTimeout(() => {
      setIsAlertVisible(false);
    }, 5000);
  };

  const handleAccept = async (email: string): Promise<void> => {
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

  const handleReject = async (email: string): Promise<void> => {
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
    <div className="min-h-screen bg-[var(--bg)] py-8 px-4 sm:px-6 lg:px-8 text-[var(--text-primary)] mt-10">
      <div className="max-w-5xl mx-auto">
        <div className="bg-[var(--surface)] rounded-xl shadow-lg overflow-hidden border border-[var(--border)]">
          {/* Alert Message */}
          <div
            className={`transition-all duration-500 ease-in-out overflow-hidden ${
              isAlertVisible
                ? "max-h-20 opacity-100 p-4 border-l-4"
                : "max-h-0 opacity-0"
            } ${
              message.includes("successfully")
                ? "bg-green-900 border-green-500"
                : "bg-red-900 border-red-500"
            }`}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {message.includes("successfully") ? (
                  <svg
                    className="h-5 w-5 text-yellow-500"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5 text-gray-500"
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
                    ? "text-yellow-300"
                    : "text-red-300"
                }`}
              >
                {message}
              </p>
              <button
                className={`ml-auto ${
                  message.includes("successfully")
                    ? "text-yellow-400 hover:text-green-300"
                    : "text-red-400 hover:text-red-300"
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
                  <div className="w-12 h-12 rounded-full bg-[var(--accent)]/30"></div>
                  <div className="mt-4 text-[var(--accent)]">
                    Loading requests...
                  </div>
                </div>
              </div>
            ) : requests.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
                {requests.map((request) => (
                  <div
                    key={request.email}
                    className="bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-md overflow-hidden transition-all duration-300 transform hover:shadow-lg hover:scale-102 hover:border-[var(--accent)]"
                  >
                    <div className="p-5">
                      <div className="flex items-center mb-4">
                        <div className="h-12 w-12 rounded-full bg-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)] text-xl font-bold">
                          {request.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-[var(--text-primary)]">
                            {request.name}
                          </h3>
                          <p className="text-sm text-[var(--text-secondary)]">
                            {request.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-2 mt-4">
                        <button
                          onClick={() => handleAccept(request.email)}
                          disabled={actionInProgress === request.email}
                          className={`inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-[var(--dark-bg)] bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--surface)] focus:ring-yellow-500 transition-colors duration-300 ${
                            actionInProgress === request.email
                              ? "opacity-75 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          {actionInProgress === request.email ? (
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-[var(--dark-bg)]"
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
                          className={`inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-[var(--dark-bg)] bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--surface)] focus:ring-red-500 transition-colors duration-300 ${
                            actionInProgress === request.email
                              ? "opacity-75 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          {actionInProgress === request.email ? (
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-[var(--dark-bg)]"
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
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--accent)]/20 text-[var(--accent)] mb-4">
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
                <h3 className="text-lg font-medium text-[var(--text-primary)]">
                  No Pending Requests
                </h3>
                <p className="mt-2 text-[var(--text-secondary)]">
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
