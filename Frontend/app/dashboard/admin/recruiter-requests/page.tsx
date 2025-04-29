"use client";
import { useEffect, useState } from "react";
import toastService from "../../../../utils/toastService";
import { useToastInit } from "../../../../hooks/useToastInit";

import {
  fetchRecruiterRequests,
  fetchAcceptedRecruiters,
  fetchRejectedRecruiters,
  acceptRecruiterRequest,
  rejectRecruiterRequest,
} from "../../../../api-services/recruiterService";
import { withRole } from "../../../../components/withRole";

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

function RecruiterRequests() {
  useToastInit();
  const [requests, setRequests] = useState<RecruiterRequest[]>([]); // All recruiter requests
  const [filter, setFilter] = useState("pending"); // Current filter: pending, accepted, rejected
  const [isLoading, setIsLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(""); // Search term for filtering
  const [rejectionMessage, setRejectionMessage] = useState("");
  const [selectedRecruiter, setSelectedRecruiter] = useState<string | null>(
    null
  );
  const [messageModal, setmessageModal] = useState<boolean>(false);
  const [currentStat, setCurrentStat] = useState<string>("");

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
      toastService.error(`Failed to fetch ${filter} recruiter requests.`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getRequestsByFilter();
  }, [filter]); // re-run whenever the filter changes

  const handleAcceptSubmit = async (email: string, message: string) => {
    setActionInProgress(email);

    try {
      const response = await acceptRecruiterRequest(email, rejectionMessage);
      if (response.ok) {
        toastService.success("Recruiter request accepted successfully!", {
          theme: "light",
        });
        getRequestsByFilter();
      } else {
        toastService.error("Failed to reject the recruiter request.", {
          theme: "light",
        });
      }
    } catch (error) {
      console.error(error);
      toastService.error("An error occurred while rejecting the request.", {
        theme: "light",
      });
    } finally {
      setActionInProgress(null);
    }
  };

  const handleRejectSubmit = async (email: string, message: string) => {
    setActionInProgress(email);
    try {
      const response = await rejectRecruiterRequest(email, rejectionMessage);
      if (response.ok) {
        toastService.success("Recruiter request rejected successfully!", {
          theme: "light",
        });
        getRequestsByFilter();
      } else {
        toastService.error("Failed to reject the recruiter request.", {
          theme: "light",
        });
      }
    } catch (error) {
      console.error(error);
      toastService.error("An error occurred while rejecting the request.", {
        theme: "light",
      });
    } finally {
      setActionInProgress(null);
    }
  };

  // Function to close the modal and reset relevant state
  const closeModal = () => {
    setmessageModal(false);
    setRejectionMessage("");
    setSelectedRecruiter(null);
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
          {/* Filter Buttons and Search Bar */}
          <div className="flex justify-between items-center p-4 border-b border-[var(--border)]">
            {/* Filter Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setFilter("pending");
                  setCurrentStat("requested-recruiters");
                }}
                className={`px-4 py-2 rounded-lg transition-colors duration-300 ${
                  filter === "pending"
                    ? "bg-[var(--accent)] text-[var(--dark-bg)]"
                    : "bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--accent)]/20"
                }`}
              >
                Requested Recruiters
              </button>
              <button
                onClick={() => setFilter("accepted")}
                className={`px-4 py-2 rounded-lg transition-colors duration-300 ${
                  filter === "accepted"
                    ? "bg-green-500 text-white"
                    : "bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-green-500/20"
                }`}
              >
                Accepted Recruiters
              </button>
              <button
                onClick={() => setFilter("rejected")}
                className={`px-4 py-2 rounded-lg transition-colors duration-300 ${
                  filter === "rejected"
                    ? "bg-red-500 text-white"
                    : "bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-red-500/20"
                }`}
              >
                Rejected Recruiters
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
                  <div className="w-12 h-12 rounded-full bg-[var(--accent)]/30"></div>
                  <div className="mt-4 text-[var(--accent)]">
                    Loading requests...
                  </div>
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
                              onClick={() =>
                                handleAcceptSubmit(
                                  request.email,
                                  rejectionMessage
                                )
                              }
                              disabled={actionInProgress === request.email}
                              className="px-3 py-1 bg-[var(--accent)] text-[var(--dark-bg)] rounded-lg hover:bg-[var(--accent)]/90 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Grant Access
                            </button>
                            <button
                              onClick={() => {
                                setSelectedRecruiter(request.email);
                                setmessageModal(true);
                              }}
                              disabled={actionInProgress === request.email}
                              className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Reject Access
                            </button>
                          </div>
                        )}
                        {filter === "accepted" && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedRecruiter(request.email);
                                setmessageModal(true);
                              }}
                              disabled={actionInProgress === request.email}
                              className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Suspend Access
                            </button>
                          </div>
                        )}
                        {filter === "rejected" && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setCurrentStat("accepted-tab");
                                setSelectedRecruiter(request.email);
                                setmessageModal(true);
                              }}
                              disabled={actionInProgress === request.email}
                              className="px-3 py-1 bg-[var(--accent)] text-[var(--dark-bg)] rounded-lg hover:bg-[var(--accent)]/90 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Restore Access
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
                  There are no {filter} recruiter requests available at the
                  moment.
                </p>
              </div>
            )}
          </div>

          {messageModal && (
            <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center backdrop-blur-sm animate-fadeIn">
              <div className="bg-[var(--surface)] rounded-lg shadow-xl p-6 w-full max-w-md text-[var(--text-primary)] relative border border-[var(--border)] animate-scaleIn">
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-lg font-semibold">
                    Reason for{" "}
                    <span
                      className={
                        currentStat === "accepted-tab"
                          ? "text-green-500"
                          : "text-red-500"
                      }
                    >
                      {currentStat === "accepted-tab"
                        ? "Restoring"
                        : "Rejecting"}{" "}
                      Access
                    </span>
                  </h2>
                  {/* Styled Close Button */}
                  <button
                    onClick={() => {
                      closeModal();
                      setCurrentStat("");
                    }}
                    className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[var(--surface-lighter)] text-[var(--text-secondary)] transition-colors"
                    aria-label="Close modal"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>

                {/* Form Field with Required Indicator */}
                <div className="mb-5">
                  <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="w-full h-28 border rounded-lg p-3 bg-[var(--bg)] text-[var(--text-primary)] border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] placeholder:text-[var(--text-secondary)]/60 transition-all"
                    placeholder={`Please provide a reason for ${currentStat === "accepted-tab" ? "restoring" : "rejecting"} access...`}
                    value={rejectionMessage}
                    onChange={(e) => setRejectionMessage(e.target.value)}
                    required
                  />
                  {rejectionMessage.trim() === "" && (
                    <p className="mt-1 text-sm text-red-500">
                      This field is required
                    </p>
                  )}
                </div>

                {/* Action Buttons with Consistent Styling */}
                <div className="flex justify-end space-x-3">
                  <button
                    className="px-4 py-2 bg-[var(--surface-lighter)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--border)] transition-colors"
                    onClick={() => {
                      closeModal();
                      setCurrentStat("");
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      rejectionMessage.trim() === ""
                        ? "bg-[var(--accent)]/50 cursor-not-allowed text-[var(--dark-bg)]/70"
                        : "bg-[var(--accent)] text-[var(--dark-bg)] hover:bg-[var(--accent)]/90"
                    }`}
                    onClick={() => {
                      if (rejectionMessage.trim() === "") return;

                      currentStat === "accepted-tab"
                        ? handleAcceptSubmit(
                            selectedRecruiter,
                            rejectionMessage
                          )
                        : handleRejectSubmit(
                            selectedRecruiter!,
                            rejectionMessage
                          );
                      closeModal();
                    }}
                    disabled={rejectionMessage.trim() === ""}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default withRole(RecruiterRequests, ["admin"]);
