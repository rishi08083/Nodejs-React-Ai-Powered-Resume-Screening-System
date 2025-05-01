import React, { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Candidate } from "./page";
import ParseCandidate from "../../../../components/ParseCandidate";
import DeleteModal, {
  AnimationType,
} from "../../../../components/recruiter/DeleteModal/DeleteModal";
import { Info } from "lucide-react";
import { useData } from "../../../../lib/dataContext";

type CandidateTableProps = {
  candidates: Candidate[];
  selectedJob: string;
  setOriginalCandidates: React.Dispatch<React.SetStateAction<Candidate[]>>;
  onCandidateDeleted?: () => void;
  onScreeningCompleted?: () => void;
  isLoading: boolean;
  handleShowFeedback: (candidate: Candidate) => void;
  setCandidates: React.Dispatch<React.SetStateAction<Candidate[]>>;
};

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const CandidateTable: React.FC<CandidateTableProps> = ({
  candidates,
  handleShowFeedback,
  setCandidates,
  setOriginalCandidates,
  selectedJob,
  onCandidateDeleted,
  onScreeningCompleted,
  isLoading,
}) => {
  const [isOpen, setIsOpen] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [viewParsedResume, setViewParsedResume] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({
    x: 0,
    y: 0,
    placement: "bottom",
  });
  const { refreshData } = useData();

  // Function to calculate and set tooltip position
  const handleTooltipHover = (e: React.MouseEvent, tooltipId: string) => {
    // Get viewport dimensions
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    // Get the target element and its position
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();

    // Calculate tooltip position
    let placement = "bottom";
    let x = rect.left + rect.width / 2; // Center by default
    let y = rect.bottom + 5; // Below the element with small gap

    // Check if tooltip would be too close to bottom of viewport
    const spaceBelow = viewportHeight - rect.bottom;
    if (spaceBelow < 40) {
      // Not enough space below
      y = rect.top - 5; // Position above the element
      placement = "top";
    }

    // Ensure X position doesn't go off-screen
    if (x < 10) x = 10;
    if (x > viewportWidth - 10) x = viewportWidth - 10;

    setActiveTooltip(tooltipId);
    setTooltipPosition({ x, y, placement });
  };

  // Function to fetch and open the resume
  const get_resume = async (candidateId: string, e: React.MouseEvent) => {
    try {
      e.preventDefault();
      const response = await fetch(
        `${BASE_URL}/api/upload/get-resume/${candidateId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        window.open(data.data.resume_url, "_blank", "noopener,noreferrer");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  // Function to handle candidate deletion
  const handleDeleteCandidate = async (candidateId) => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/candidates/delete/${candidateId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );

      if (response.ok) {
        // Use functional update to ensure we work with the latest state
        setCandidates((prevCandidates) => {
          const updatedCandidates = prevCandidates.filter(
            (candidate) => candidate.id !== candidateId
          );
          return updatedCandidates;
        });

        // Notify context about data changes
        refreshData("candidates");
        refreshData("analytics");

        // Call parent callback
        if (onCandidateDeleted) {
          onCandidateDeleted();
        }

        console.log(`Candidate ${candidateId} deleted successfully`);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
    } catch (error) {
      console.error("Error deleting candidate:", error);
    }
  };

  // Function to view parsed resume
  const handleViewParsedResume = (candidateId: string) => {
    setViewParsedResume(viewParsedResume === candidateId ? null : candidateId);
  };

  const handleReScreenCandidate = async (candidateId) => {
    try {
      // Close the dropdown if open
      setIsOpen(null);

      // Set the specific candidate to loading state
      setCandidates((prev) =>
        prev.map((c) =>
          c.id === candidateId ? { ...c, isRescreening: true } : c
        )
      );

      // Show loading tooltip
      setActiveTooltip(`rescreening-${candidateId}`);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/screening/screen_candidate/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
          body: JSON.stringify({
            candidate_id: candidateId,
          }),
        }
      );

      if (response.ok) {
        // Get the updated candidate details
        const updatedCandidateResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/candidates/${candidateId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + localStorage.getItem("token"),
            },
          }
        );

        if (updatedCandidateResponse.ok) {
          const result = await updatedCandidateResponse.json();
          const updatedCandidate = result.data;

          // Flash the success indicator
          setActiveTooltip(`rescreened-${candidateId}`);

          // Update the candidate in the list with new data and no loading state
          setCandidates((prev) =>
            prev.map((c) =>
              c.id === candidateId
                ? {
                    ...updatedCandidate,
                    isRescreening: false,
                    freshlyScreened: true,
                  }
                : c
            )
          );

          // Notify data context about changes
          refreshData("analytics");
          refreshData("screeningResults");

          // Call parent callback
          if (onScreeningCompleted) {
            onScreeningCompleted();
          }

          // Remove the "freshlyScreened" flag after animation
          setTimeout(() => {
            setCandidates((prev) =>
              prev.map((c) =>
                c.id === candidateId ? { ...c, freshlyScreened: false } : c
              )
            );
          }, 3000);
        }
      } else {
        // Error handling
        setCandidates((prev) =>
          prev.map((c) =>
            c.id === candidateId
              ? { ...c, isRescreening: false, screeningError: true }
              : c
          )
        );
        setActiveTooltip(`rescreerror-${candidateId}`);
      }
    } catch (error) {
      // Error handling
      setCandidates((prev) =>
        prev.map((c) =>
          c.id === candidateId
            ? { ...c, isRescreening: false, screeningError: true }
            : c
        )
      );
      setActiveTooltip(`rescreerror-${candidateId}`);
    } finally {
      // Clear error state after a while
      setTimeout(() => {
        setCandidates((prev) =>
          prev.map((c) =>
            c.id === candidateId ? { ...c, screeningError: false } : c
          )
        );
      }, 3000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="mb-3 bg-[var(--surface)] rounded-xl shadow-lg overflow-hidden border border-[var(--border)]"
    >
      {candidates.length > 0 ? (
        <div className="overflow-x-auto h-[600px] flex flex-col">
          {" "}
          {/* Set a fixed height and use flex column */}
          <table className="min-w-full table-auto border-collapse">
           

            {/* Make the header sticky */}
            <thead>
              <tr className="bg-[var(--bg)] border-b border-[var(--border)]">
                <th className="px-4 py-4 text-left text-sm font-semibold text-[var(--text-primary)]">
                  Candidate Name
                </th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-[var(--text-primary)]  md:table-cell">
                  Email
                </th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-[var(--text-primary)]  lg:table-cell">
                  Contact
                </th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-[var(--text-primary)]">
                  Screening Score
                </th>
                <th className="px-4 py-4 text-center text-sm font-semibold text-[var(--text-primary)]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((candidate, index) => (
                <React.Fragment key={candidate.id}>
                  <motion.tr
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.4 }}
                    className="border-b border-[var(--border)] hover:bg-[var(--bg)] transition-all duration-300"
                  >
                    {/* Candidate Name Column */}
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <span className="font-medium text-[var(--text-primary)] truncate max-w-[150px]">
                          {candidate.name
                            ? candidate.name
                                .replace(/\s+/g, " ")
                                .toLowerCase()
                                .replace(/\b\w/g, (char) => char.toUpperCase())
                            : "Unknown"}
                        </span>
                      </div>
                    </td>

                    {/* Email Column - Separated from Name */}
                    <td className="px-4 py-4  md:table-cell">
                      <div className="flex items-center space-x-2 relative">
                        <a
                          href={`mailto:${candidate.email}`}
                          className="text-sm text-[var(--text-primary)] truncate max-w-[200px] block hover:underline"
                        >
                          {candidate.email}
                        </a>
                        <button
                          onClick={(e) => {
                            navigator.clipboard.writeText(candidate.email);
                            // Use the event parameter from the onClick handler
                            const target = e.currentTarget;
                            const rect = target.getBoundingClientRect();

                            // Calculate tooltip position considering viewport boundaries
                            const viewportHeight = window.innerHeight;
                            const viewportWidth = window.innerWidth;

                            let placement = "bottom";
                            let x = rect.left + rect.width / 2;
                            let y = rect.bottom + 5;

                            // Check if tooltip would be too close to bottom of viewport
                            const spaceBelow = viewportHeight - rect.bottom;
                            if (spaceBelow < 40) {
                              y = rect.top - 5;
                              placement = "top";
                            }

                            // Ensure X position doesn't go off-screen
                            if (x < 10) x = 10;
                            if (x > viewportWidth - 10) x = viewportWidth - 10;

                            setTooltipPosition({
                              x: x,
                              y: y,
                              placement: placement,
                            });

                            setActiveTooltip(`copied-${candidate.id}`);
                            setTimeout(() => setActiveTooltip(null), 2000);
                          }}
                          className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                          aria-label="Copy Email"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect
                              x="9"
                              y="9"
                              width="13"
                              height="13"
                              rx="2"
                              ry="2"
                            ></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                          </svg>
                        </button>
                      </div>
                    </td>

                    {/* Contact Info Column */}
                    <td className="px-4 py-4 lg:table-cell">
                      <a
                        href={`tel:${candidate.phone_number}`}
                        className="text-sm text-[var(--text-primary)] hover:underline"
                      >
                        {candidate.phone_number || "Not provided"}
                      </a>
                    </td>

                    {/* Feedback Button with score */}
                    {/* Feedback Button with score */}
                    <td className="px-4 py-4">
                      <div
                        className="relative tooltip-container"
                        onMouseEnter={(e) =>
                          handleTooltipHover(e, `feedback-${candidate.id}`)
                        }
                        onMouseLeave={() => setActiveTooltip(null)}
                      >
                        <button
                          onClick={() => handleShowFeedback(candidate)}
                          disabled={
                            candidate?.is_recommended === "NOT SET" ||
                            candidate?.isRescreening
                          }
                          className={`flex items-center space-x-2 px-2 py-0.5 rounded-md transition-all duration-300  hover:shadow-md`}
                        >
                          <div
                            className={`relative w-8 h-8 rounded-full flex items-center justify-center ${
                              candidate?.isRescreening
                                ? "bg-blue-500/20"
                                : candidate?.freshlyScreened
                                  ? "bg-green-500/30"
                                  : candidate?.is_recommended === "YES"
                                    ? "bg-green-500/20"
                                    : candidate?.is_recommended === "NO"
                                      ? "bg-red-500/20"
                                      : "bg-gray-500/20"
                            }`}
                          >
                            {candidate?.isRescreening ? (
                              <svg
                                className="animate-spin h-4 w-4 text-blue-500"
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
                              <span
                                className={`text-xs font-bold ${candidate?.freshlyScreened ? "animate-bounce" : ""}`}
                              >
                                {candidate?.match_score}%
                              </span>
                            )}
                          </div>
                          <span className="font-medium text-xs flex items-center justify-center">
                            {candidate?.isRescreening ? (
                              "Screening..."
                            ) : (
                              <Info
                                size={18}
                                className={`text-[var(--accent)] ${candidate?.freshlyScreened ? "animate-pulse" : ""}`}
                              />
                            )}
                          </span>
                        </button>
                      </div>
                    </td>

                    {/* Actions Column */}
                    <td className="px-4 py-4">
                      <div className="flex justify-end space-x-1.5">
                        {/* Action Buttons Group */}
                        <div className="inline-flex rounded-md shadow-sm border border-[var(--border)]">
                          {/* View Resume Button */}
                          <div
                            className="relative tooltip-container"
                            onMouseEnter={(e) =>
                              handleTooltipHover(e, `resume-${candidate.id}`)
                            }
                            onMouseLeave={() => setActiveTooltip(null)}
                          >
                            <button
                              onClick={(e) => get_resume(candidate.id, e)}
                              className="p-1.5 bg-[var(--surface)] hover:bg-[var(--surface-lighter)] text-[var(--text-primary)] rounded-l transition-colors duration-200 border-r border-[var(--border)]"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                              </svg>
                            </button>
                          </div>

                          {/* Re-Screen Button */}
                          {/* <div
                            className="relative tooltip-container"
                            onMouseEnter={(e) =>
                              handleTooltipHover(e, `rescreen-${candidate.id}`)
                            }
                            onMouseLeave={() => setActiveTooltip(null)}
                          >
                            <button
                              onClick={() =>
                                handleReScreenCandidate(candidate.id)
                              }
                              className={`p-1.5 transition-colors duration-200 border-r border-[var(--border)]
                          ${
                            candidate?.isRescreening
                              ? "bg-blue-100/30 text-blue-500 cursor-wait"
                              : candidate?.screeningError
                                ? "bg-red-100/20 text-red-500"
                                : candidate?.freshlyScreened
                                  ? "bg-green-100/20 text-green-500"
                                  : "bg-[var(--surface)] hover:bg-[var(--surface-lighter)] text-[var(--text-primary)]"
                          }`}
                              disabled={candidate?.isRescreening}
                            >
                              {candidate?.isRescreening ? (
                                <svg
                                  className="animate-spin"
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                                </svg>
                              ) : candidate?.screeningError ? (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="animate-pulse"
                                >
                                  <circle cx="12" cy="12" r="10"></circle>
                                  <line x1="12" y1="8" x2="12" y2="12"></line>
                                  <line
                                    x1="12"
                                    y1="16"
                                    x2="12.01"
                                    y2="16"
                                  ></line>
                                </svg>
                              ) : candidate?.freshlyScreened ? (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="text-green-500"
                                >
                                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                </svg>
                              ) : (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M21 2v6h-6"></path>
                                  <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
                                  <path d="M3 22v-6h6"></path>
                                  <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
                                </svg>
                              )}
                            </button>
                          </div> */}

                          {/* Parse Resume Button */}
                          <div
                            className="relative tooltip-container"
                            onMouseEnter={(e) =>
                              handleTooltipHover(e, `parsed-${candidate.id}`)
                            }
                            onMouseLeave={() => setActiveTooltip(null)}
                          >
                            <button
                              onClick={() =>
                                handleViewParsedResume(candidate.id)
                              }
                              className={`p-1.5 bg-[var(--surface)] hover:bg-[var(--surface-lighter)] text-[var(--text-primary)] transition-colors duration-200 
                          ${
                            viewParsedResume === candidate.id
                              ? "bg-[var(--blue-highlight)]"
                              : ""
                          } border-r border-[var(--border)]`}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <path d="M14 2v6h6"></path>
                                <path d="M16 13H8"></path>
                                <path d="M16 17H8"></path>
                                <path d="M10 9H8"></path>
                              </svg>
                            </button>
                          </div>

                          {/* More Actions Button */}
                          <div
                            className="relative tooltip-container"
                            onMouseEnter={(e) =>
                              handleTooltipHover(e, `more-${candidate.id}`)
                            }
                            onMouseLeave={() => setActiveTooltip(null)}
                          >
                            <button
                              onClick={() =>
                                setIsOpen(
                                  isOpen === candidate.id ? null : candidate.id
                                )
                              }
                              className="p-1.5 bg-[var(--surface)] hover:bg-[var(--surface-lighter)] text-[var(--text-primary)] rounded-r transition-colors duration-200"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <circle cx="12" cy="12" r="1"></circle>
                                <circle cx="12" cy="5" r="1"></circle>
                                <circle cx="12" cy="19" r="1"></circle>
                              </svg>
                            </button>
                          </div>
                          {isOpen === candidate.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.2 }}
                              className="absolute right-0 mt-7 w-36 rounded-md shadow-lg bg-[var(--surface)] ring-1 ring-[var(--border)] focus:outline-none z-50"
                              tabIndex={-1}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <DeleteModal
                                isOpen={isDeleteModalOpen}
                                onClose={() => setIsDeleteModalOpen(false)}
                                onDelete={() =>
                                  handleDeleteCandidate(candidate.id)
                                }
                                title={candidate.name}
                                hoverAnimation={true}
                                animationType={AnimationType.FadeIn}
                                deleteButtonAnimation={true}
                                animationDuration={300}
                                message="Are you sure you want to delete this candidate? This action cannot be undone."
                              />
                              <div
                                className="py-1"
                                role="menu"
                                aria-orientation="vertical"
                                aria-labelledby="options-menu"
                              >
                                <button
                                  onClick={() => {
                                    setIsDeleteModalOpen(true);
                                  }}
                                  className="block w-full px-4 py-2 text-sm text-red-400 hover:bg-[var(--border)] hover:text-red-300 transition-colors duration-300 text-left"
                                  role="menuitem"
                                >
                                  <div className="flex items-center">
                                    <svg
                                      className="mr-2 h-4 w-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                      ></path>
                                    </svg>
                                    Delete
                                  </div>
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </td>
                  </motion.tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-16 flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center px-4 py-8"
          >
            <svg
              className="mx-auto h-16 w-16 text-[var(--text-secondary)] mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <h3 className="text-xl font-medium text-[var(--text-primary)] mb-2">
              No Candidates Found
            </h3>
            <p className="text-[var(--text-secondary)] max-w-md mx-auto">
              {selectedJob
                ? "No candidates have applied for this job position yet. Check back later or select another job."
                : "Please select a job from the dropdown to view candidates."}
            </p>
          </motion.div>
        </div>
      )}

      {/* Unified tooltip that appears for all tooltip types */}
      {activeTooltip && (
        <div
          className="fixed z-50 px-2 py-1 rounded text-xs bg-[var(--bg)] border border-[var(--border)] shadow-md text-[var(--text-primary)] whitespace-nowrap"
          style={{
            top:
              tooltipPosition.placement === "bottom"
                ? `${tooltipPosition.y}px`
                : "auto",
            bottom:
              tooltipPosition.placement === "top"
                ? `${window.innerHeight - tooltipPosition.y}px`
                : "auto",
            left: `${tooltipPosition.x}px`,
            transform: "translateX(-50%)",
          }}
        >
          {activeTooltip.startsWith("parsed-") &&
            (viewParsedResume === activeTooltip.split("-")[1]
              ? "Hide Parsed Resume"
              : "View Parsed Resume")}
          {activeTooltip.startsWith("resume-") && "View Resume"}
          {activeTooltip.startsWith("feedback-") &&
            (candidates.find((c) => `feedback-${c.id}` === activeTooltip)
              ?.is_screened
              ? "View Feedback"
              : "Pending Screening")}
          {activeTooltip.startsWith("more-") && "More Actions"}
          {activeTooltip.startsWith("copied-") && "Copied!"}
          {activeTooltip.startsWith("rescreen-") && "Re-Screen Candidate"}
          {activeTooltip.startsWith("rescreening-") &&
            "Screening in progress..."}
          {activeTooltip.startsWith("rescreened-") &&
            "Successfully re-screened!"}
          {activeTooltip.startsWith("rescreerror-") &&
            "Error re-screening candidate"}
        </div>
      )}

      {/* Parsed Resume Modal View */}
      <AnimatePresence>
        {viewParsedResume && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto"
          >
            <div className="bg-[var(--surface)] rounded-lg shadow-lg p-6 w-full max-w-3xl h-[90vh] relative my-4 mx-auto overflow-y-auto">
              <button
                onClick={() => setViewParsedResume(null)}
                className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--surface-lighter)] hover:bg-[var(--bg)] p-2 rounded-full transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
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
              <ParseCandidate candidateId={viewParsedResume} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CandidateTable;
