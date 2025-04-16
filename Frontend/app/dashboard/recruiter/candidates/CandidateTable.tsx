import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Candidate } from "./page";
import ParseCandidate from "../../../../components/ParseCandidate";
import DeleteModal from "../../../../components/recruiter/DeleteModal/DeleteModal";
import { AnimationType } from "../../../../components/recruiter/DeleteModal/DeleteModal";
type CandidateTableProps = {
  currentCandidates: Candidate[];
  selectedJob: string;
  handleShowFeedback: (candidate: Candidate) => void;
  setCandidates: React.Dispatch<React.SetStateAction<Candidate[]>>;
  setSuccessMessage: React.Dispatch<React.SetStateAction<string>>;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
};

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const CandidateTable: React.FC<CandidateTableProps> = ({
  currentCandidates,
  selectedJob,
  handleShowFeedback,
  setCandidates,
}) => {
  const [isOpen, setIsOpen] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [originalCandidates, setOriginalCandidates] =
    useState(currentCandidates);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [viewParsedResume, setViewParsedResume] = useState<string | null>(null);

  // Function to fetch and open the resume
  const get_resume = async (candidateId: string, e: React.MouseEvent) => {
    try {
      e.preventDefault();
      const response = await fetch(
        `${BASE_URL}/upload/get-resume/${candidateId}`,
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
  const handleDeleteCandidate = async (candidateId: string) => {
    try {
      const response = await fetch(
        `${BASE_URL}/candidates/delete/${candidateId}`,
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
        setOriginalCandidates((prevOriginal) =>
          prevOriginal.filter((candidate) => candidate.id !== candidateId)
        ); // Update originalCandidates too
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="bg-[var(--surface)] rounded-xl shadow-lg overflow-hidden border border-[var(--border)]"
    >
      {currentCandidates.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse">
            <thead>
              <tr className="bg-[var(--bg)] border-b border-[var(--border)]">
                <th className="px-4 py-4 text-left text-sm font-semibold text-[var(--text-primary)]">
                  Candidate Name
                </th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-[var(--text-primary)] hidden md:table-cell">
                  Email
                </th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-[var(--text-primary)] hidden lg:table-cell">
                  Contact
                </th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-[var(--text-primary)]">
                  Compatibility Score
                </th>
                <th className="px-4 py-4 text-right text-sm font-semibold text-[var(--text-primary)]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {currentCandidates.map((candidate, index) => (
                <React.Fragment key={candidate.id}>
                  <motion.tr
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.4 }}
                    className="border-b border-[var(--border)] hover:bg-[var(--bg)] transition-all duration-300"
                  ></motion.tr>
                  {/* Candidate Name Column */}
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      <span className="font-medium text-[var(--text-primary)] truncate max-w-[150px]">
                        {candidate.name || "Unknown"}
                      </span>
                    </div>
                  </td>

                  {/* Email Column - Separated from Name */}
                  <td className="px-4 py-4 hidden md:table-cell">
                    <a
                      href={`mailto:${candidate.email}`}
                      className="text-sm text-[var(--text-primary)] truncate max-w-[200px] block hover:underline"
                    >
                      {candidate.email}
                    </a>
                  </td>

                  {/* Contact Info Column */}
                  <td className="px-4 py-4 hidden lg:table-cell">
                    <a
                      href={`tel:${candidate.phone_number}`}
                      className="text-sm text-[var(--text-primary)] hover:underline"
                    >
                      {candidate.phone_number || "Not provided"}
                    </a>
                  </td>

                  {/* Assessment Column */}
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded border ${
                          candidate?.is_recommended?.toUpperCase() === "YES"
                            ? "bg-green-100 text-green-700 border-green-400"
                            : candidate?.is_recommended?.toUpperCase() === "NO"
                              ? "bg-red-100 text-red-700 border-red-400"
                              : "bg-yellow-100 text-yellow-700 border-yellow-400"
                        }`}
                        style={{ borderRadius: "4px" }} // Makes the badge square
                      >
                        {candidate?.match_score != null
                          ? `${candidate.match_score}% match`
                          : "Analyzing..."}
                      </span>
                    </div>
                  </td>

                  {/* Actions Column */}
                  <td className="px-4 py-4">
                    <div className="flex justify-end space-x-1.5">
                      {/* Combined Assessment & Feedback Button */}
                      <div
                        className="relative tooltip-container"
                        onMouseEnter={() =>
                          setActiveTooltip(`feedback-${candidate.id}`)
                        }
                        onMouseLeave={() => setActiveTooltip(null)}
                      >
                        <button
                          onClick={() => handleShowFeedback(candidate)}
                          className={`p-1.5 flex items-center ${
                            candidate?.is_screened
                              ? "bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-black"
                              : "bg-[var(--surface-lighter)] text-[var(--text-secondary)]"
                          } 
                        rounded transition-colors duration-200 font-medium text-xs`}
                          disabled={!candidate?.is_screened}
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
                            className="mr-1"
                          >
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                          </svg>
                          <span className="hidden sm:inline">Feedback</span>
                        </button>
                        {activeTooltip === `feedback-${candidate.id}` && (
                          <div className="fixed z-50 mt-1 px-2 py-1 rounded text-xs bg-[var(--bg)] border border-[var(--border)] shadow-md text-[var(--text-primary)] whitespace-nowrap">
                            {candidate?.is_screened
                              ? "View Feedback"
                              : "Pending Screening"}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons Group */}
                      <div className="inline-flex rounded-md shadow-sm border border-[var(--border)]">
                        {/* View Resume Button */}
                        <div
                          className="relative tooltip-container"
                          onMouseEnter={() =>
                            setActiveTooltip(`resume-${candidate.id}`)
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
                          {activeTooltip === `resume-${candidate.id}` && (
                            <div className="fixed z-50 mt-1 px-2 py-1 rounded text-xs bg-[var(--bg)] border border-[var(--border)] shadow-md text-[var(--text-primary)] whitespace-nowrap">
                              View Resume
                            </div>
                          )}
                        </div>

                        {/* Parse Resume Button */}
                        <div
                          className="relative tooltip-container"
                          onMouseEnter={() =>
                            setActiveTooltip(`parsed-${candidate.id}`)
                          }
                          onMouseLeave={() => setActiveTooltip(null)}
                        >
                          <button
                            onClick={() => handleViewParsedResume(candidate.id)}
                            className={`p-1.5 bg-[var(--surface)] hover:bg-[var(--surface-lighter)] text-[var(--text-primary)] transition-colors duration-200 
                          ${viewParsedResume === candidate.id ? "bg-[var(--blue-highlight)]" : ""} border-r border-[var(--border)]`}
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
                          {activeTooltip === `parsed-${candidate.id}` && (
                            <div className="fixed z-50 mt-1 px-2 py-1 rounded text-xs bg-[var(--bg)] border border-[var(--border)] shadow-md text-[var(--text-primary)] whitespace-nowrap">
                              {viewParsedResume === candidate.id
                                ? "Hide Parsed Resume"
                                : "View Parsed Resume"}
                            </div>
                          )}
                        </div>

                        {/* More Actions Button */}
                        <div
                          className="relative tooltip-container"
                          onMouseEnter={() =>
                            setActiveTooltip(`more-${candidate.id}`)
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
                          {activeTooltip === `more-${candidate.id}` && (
                            <div className="fixed z-50 mt-1 px-2 py-1 rounded text-xs bg-[var(--bg)] border border-[var(--border)] shadow-md text-[var(--text-primary)] whitespace-nowrap">
                              More Actions
                            </div>
                          )}

                          {isOpen === candidate.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.2 }}
                              className="absolute right-0 mt-1 w-36 rounded-md shadow-lg bg-[var(--surface)] ring-1 ring-[var(--border)] focus:outline-none z-50"
                              tabIndex={-1}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div
                                className="py-1"
                                role="menu"
                                aria-orientation="vertical"
                                aria-labelledby="options-menu"
                              >
                                <DeleteModal
                                  isOpen={isDeleteModalOpen}
                                  onClose={() => setIsDeleteModalOpen(false)}
                                  onDelete={() =>
                                    handleDeleteCandidate(candidate.id)
                                  }
                                  title={candidate.name}
                                  hoverAnimation={true}
                                  animationType={AnimationType.SlideIn}
                                  deleteButtonAnimation={true}
                                  animationDuration={800}
                                  message="Are you sure you want to delete this candidate? This action cannot be undone."
                                />
                                <button
                                  onClick={() => {
                                    setIsDeleteModalOpen(true);
                                    //setIsOpen(null);
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
                    </div>
                  </td>
                  {/* Parsed Resume Modal View */}
                  <AnimatePresence>
                    {viewParsedResume === candidate.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
                      >
                        <div className="bg-[var(--surface)] rounded-lg shadow-lg p-6 w-full max-w-3xl relative">
                          <button
                            onClick={() => setViewParsedResume(null)}
                            className="absolute top-2 right-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
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
                          <ParseCandidate candidateId={candidate.id} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
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
    </motion.div>
  );
};

export default CandidateTable;
