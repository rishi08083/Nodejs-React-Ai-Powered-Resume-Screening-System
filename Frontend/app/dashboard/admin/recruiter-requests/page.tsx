"use client";

import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
    fetchRecruiterRequests,
    fetchAcceptedRecruiters,
    fetchRejectedRecruiters,
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
 
export default function RecruiterRequests() {
  const [requests, setRequests] = useState([]); // All recruiter requests
  const [filter, setFilter] = useState("pending"); // Current filter: pending, accepted, rejected
  const [isLoading, setIsLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // Search term for filtering

  const getRequestsByFilter = async (): Promise<void> => {
    setIsLoading(true);
    try {
      let data: ApiResponse;

      if (filter === "pending") {
        data = (await fetchRecruiterRequests()) as unknown as ApiResponse;
      } else if (filter === "accepted") {
        data = (await fetchAcceptedRecruiters()) as unknown as ApiResponse;
      } else {
        data = (await fetchRejectedRecruiters()) as unknown as ApiResponse;
      }

      setRequests(data.data.users);
    } catch (error) {
      toast.error(`Failed to fetch ${filter} recruiter requests.`);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    getRequestsByFilter();
  }, [filter]); // re-run whenever the filter changes

  const handleAccept = async (email) => {
    setActionInProgress(email);
    try {
      const response = await acceptRecruiterRequest(email);
      if (response.ok) {
        toast.success("Recruiter request accepted successfully!", {
          theme: "light",
        });
        getRequestsByFilter();
      } else {
        toast.error("Failed to accept the recruiter request.", {
          theme: "light",
        });
      }
    } catch (error) {
      toast.error("An error occurred while accepting the request.", {
        theme: "light",
      });
    } finally {
      setActionInProgress(null);
    }
  };

  const handleReject = async (email) => {
    setActionInProgress(email);
    try {
      const response = await rejectRecruiterRequest(email);
      if (response.ok) {
        toast.success("Recruiter request rejected successfully!", {
          theme: "light",
        });
        getRequestsByFilter();
      } else {
        toast.error("Failed to reject the recruiter request.", {
          theme: "light",
        });
      }
    } catch (error) {
      toast.error("An error occurred while rejecting the request.", {
        theme: "light",
      });
    } finally {
      setActionInProgress(null);
    }
  };

  // Filter requests based on the selected filter and search term
  const filteredRequests = requests.filter(
    (req) =>
      req.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.email.toLowerCase().includes(searchTerm.toLowerCase())
  );  

  return (
    <div className="min-h-screen bg-[var(--bg)] py-8 px-0 sm:px-0 lg:px-0 text-[var(--text-primary)] mt-10">
      <div className="mx-auto">
        <div className="bg-[var(--surface)] rounded-xl shadow-lg overflow-hidden border border-[var(--border)]">
          {/* Display Message */}
          <ToastContainer theme="dark" autoClose={3000}/>

          {/* Filter Buttons and Search Bar */}
          <div className="flex justify-between items-center p-4 border-b border-[var(--border)]">
            {/* Filter Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={() => setFilter("pending")}
                className={`px-4 py-2 rounded-lg transition-colors duration-300 ${
                  filter === "pending"
                    ? "bg-[var(--accent)] text-[var(--dark-bg)]"
                    : "bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--accent)]/20"
                }`}
              >
                Requested
              </button>
              <button
                onClick={() => setFilter("accepted")}
                className={`px-4 py-2 rounded-lg transition-colors duration-300 ${
                  filter === "accepted"
                    ? "bg-green-500 text-white"
                    : "bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-green-500/20"
                }`}
              >
                Accepted
              </button>
              <button
                onClick={() => setFilter("rejected")}
                className={`px-4 py-2 rounded-lg transition-colors duration-300 ${
                  filter === "rejected"
                    ? "bg-red-500 text-white"
                    : "bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-red-500/20"
                }`}
              >
                Rejected
              </button>
            </div>

            {/* Search Bar */}
            <div>
              <input
                type="text"
                placeholder="Search by name or email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border border-[var(--border)] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] bg-[var(--surface)] text-[var(--text-primary)] placeholder-[var(--text-secondary)]"
              />
            </div>
          </div>

          {/* Table */}
          <div className="p-6">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-pulse flex flex-col items-center">
                  <div className="w-12 h-12 roun ded-full bg-[var(--accent)]/30"></div>
                  <div className="mt-4 text-[var(--accent)]">Loading requests...</div>
                </div>
              </div>
            ) : filteredRequests.length > 0 ? (
              <table className="min-w-full table-auto border-collapse">
                <thead>
                  <tr className="bg-[var(--surface)] border-b border-[var(--border)]">
                    <th className="px-4 py-2 text-left text-sm font-semibold text-[var(--text-primary)]">
                      Name
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-[var(--text-primary)]">
                      Email
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-[var(--text-primary)]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((request) => (
                    <tr
                      key={request.email}
                      className="border-b border-[var(--border)] hover:bg-[var(--accent)]/5 transition-colors duration-300"
                    >
                      <td className="px-4 py-2 text-sm text-[var(--text-primary)]">
                        {request.name}
                      </td>
                      <td className="px-4 py-2 text-sm text-[var(--text-primary)]">
                        {request.email}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {filter === "pending" && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleAccept(request.email)}
                              disabled={actionInProgress === request.email}
                              className="px-3 py-1 bg-[var(--accent)] text-[var(--dark-bg)] rounded-lg hover:bg-[var(--accent)]/90 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleReject(request.email)}
                              disabled={actionInProgress === request.email}
                              className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {filter === "accepted" && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleReject(request.email)}
                              disabled={actionInProgress === request.email}
                              className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {filter === "rejected" && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleAccept(request.email)}
                              disabled={actionInProgress === request.email}
                              className="px-3 py-1 bg-[var(--accent)] text-[var(--dark-bg)] rounded-lg hover:bg-[var(--accent)]/90 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Accept
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                  No {filter} requests found
                </h3>
                <p className="mt-2 text-[var(--text-secondary)]">
                  There are no {filter} recruiter requests available at the moment.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}