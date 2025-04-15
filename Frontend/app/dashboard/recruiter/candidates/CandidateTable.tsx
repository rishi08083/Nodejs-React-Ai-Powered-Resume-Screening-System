import React, { useState } from "react";
import { motion } from "framer-motion";
import { Candidate } from "./page";

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
  const [originalCandidates, setOriginalCandidates] =
    useState(currentCandidates);

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
          console.log("Updated candidates:", updatedCandidates); // Debug log
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
                <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-primary)]">
                  Candidate Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-primary)]">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-primary)]">
                  Contact
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-primary)]">
                  Compatibility(%)
                </th>

                <th className="px-4 py-4 text-left text-sm font-semibold text-[var(--text-primary)]">
                  Recommended
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-primary)]">
                  Feedback
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-primary)]">
                  Resume
                </th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-[var(--text-primary)]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {currentCandidates.map((candidate, index) => (
                // how to print all the keys of the candidate object in the console

                <motion.tr
                  key={candidate.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                  className="border-b border-[var(--border)] hover:bg-[var(--bg)] transition-all duration-300"
                >
                  <td className="px-6 py-4 text-sm font-medium text-[var(--text-primary)]">
                    {candidate.name}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-[var(--text-primary)]">
                    {candidate.email}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-[var(--text-primary)]">
                    {candidate.phone_number}
                  </td>

                  {/* Compatibility Score */}
                  <td className="px-6 py-4 text-sm">
                    {candidate?.match_score != null ? (
                      <span
                        className={`inline-block px-3 py-1 text-sm font-semibold rounded ${
                          candidate.is_recommended === "YES"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {candidate.match_score} %
                      </span>
                    ) : (
                      <motion.div
                        className="px-4 py-2 bg-[var(--surface)] text-[var(--text-secondary)] font-medium rounded-lg shadow flex items-center justify-center"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-[var(--accent)]"
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
                        Loading...
                      </motion.div>
                    )}
                  </td>
                  {/* Recommended */}
                  <td className="px-6 py-4 text-sm">
                    {candidate?.is_recommended.toUpperCase() === "YES" ? (
                      <span className="text-green-400 font-medium">Yes</span>
                    ) : candidate?.is_recommended.toUpperCase() === "NO" ? (
                      <span className="text-red-400 font-medium">No</span>
                    ) : (
                      <span className="text-yellow-400 font-medium">
                        Pending
                      </span>
                    )}
                  </td>

                  {/* Feedback Button */}
                  <td className="px-6 py-4 text-sm">
                    {candidate?.is_screened ? (
                      <div className="relative group">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleShowFeedback(candidate)}
                          className="px-4 py-2 border border-[var(--accent)] text-[var(--accent)] font-medium rounded-lg shadow hover:bg-[var(--accent)] hover:text-[var(--dark-bg)] transition-all duration-300"
                        >
                          Feedback
                        </motion.button>
                        <div
                          className="absolute z-10 inline-block px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700 group-hover:opacity-100 group-hover:visible transition-opacity duration-300"
                          style={{
                            visibility: "hidden",
                            top: "-40px",
                            left: "50%",
                            transform: "translateX(-50%)",
                          }}
                        >
                          View Feedback
                          <div
                            className="tooltip-arrow"
                            style={{
                              position: "absolute",
                              top: "100%",
                              left: "50%",
                              transform: "translateX(-50%)",
                              width: "0",
                              height: "0",
                              borderLeft: "5px solid transparent",
                              borderRight: "5px solid transparent",
                              borderTop: "5px solid #1a202c",
                            }}
                          ></div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-[var(--text-secondary)]">
                        {candidate.is_screened === false
                          ? "Pending Screening"
                          : "Not Available"}
                      </span>
                    )}
                  </td>

                  {/* Resume Button */}
                  <td className="px-6 py-4 text-sm">
                    <div className="relative group">
                      <button
                        onClick={(e) => {
                          get_resume(candidate.id, e);
                        }}
                        className="px-3 py-2 bg-[var(--border)] text-[var(--text-primary)] font-medium rounded-lg hover:bg-[var(--blue-highlight)] transition-colors duration-200 shadow-md hover:shadow-lg flex items-center space-x-1"
                        tabIndex={0}
                        style={{ transform: "none" }}
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
                          className="lucide lucide-eye h-4 w-4"
                        >
                          <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      </button>
                      <div className="absolute z-50 bg-[var(--surface)] text-[var(--text-secondary)] text-sm p-2 rounded shadow-lg border border-[var(--border)] top-[-40px] left-1/2 transform -translate-x-1/2 whitespace-nowrap group-hover:block hidden">
                        View Resume
                      </div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="absolute top-[-50px] left-1/2 transform -translate-x-1/2 h-4 w-4 text-[var(--text-secondary)] hidden group-hover:block"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </div>
                  </td>

                  {/* Actions Dropdown */}
                  <td className="px-6 py-4 text-sm relative">
                    <button
                      onClick={() =>
                        setIsOpen(isOpen === candidate.id ? null : candidate.id)
                      }
                      className="px-3 py-2 bg-[var(--border)] text-[var(--text-primary)] font-medium rounded-lg hover:bg-[var(--blue-highlight)] transition-colors duration-200 shadow-md hover:shadow-lg flex items-center space-x-1"
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
                        className="lucide lucide-more-vertical h-4 w-4"
                      >
                        <circle cx="12" cy="12" r="1"></circle>
                        <circle cx="12" cy="5" r="1"></circle>
                        <circle cx="12" cy="19" r="1"></circle>
                      </svg>
                    </button>
                  </td>
                  {isOpen === candidate.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-15 w-36 rounded-md shadow-lg bg-[var(--surface)] ring-1 ring-[var(--border)] focus:outline-none z-50"
                      tabIndex={-1}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div
                        className="py-1"
                        role="menu"
                        aria-orientation="vertical"
                        aria-labelledby="options-menu"
                      >
                        <button
                          onClick={() => {
                            handleDeleteCandidate(candidate.id); // Ensure this uses the correct candidate.id
                            setIsOpen(null); // Close dropdown after action
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
                </motion.tr>
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
            <p className="text-[var(--text-secondary)] max-w-md">
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
