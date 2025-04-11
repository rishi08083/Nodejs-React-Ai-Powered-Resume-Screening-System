import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Candidate, Feedback } from "./page";

type FeedbackModalProps = {
  selectedFeedback: Feedback | null;
  closeModal: () => void;
};

const FeedbackModal: React.FC<FeedbackModalProps> = ({ selectedFeedback, closeModal }) => {

  console.log("Selected Feedback:", selectedFeedback);
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeModal]);

  if (!selectedFeedback) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="bg-[var(--surface)] rounded-xl shadow-2xl p-8 w-full max-w-lg border border-[var(--border)]"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">
            Candidate Feedback
          </h2>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={closeModal}
            className="text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors duration-300"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </motion.button>
        </div>

        <div className="space-y-4">
          <div className="p-3 bg-[var(--blue-highlight)] rounded-lg flex items-center justify-between">
            <p className="text-[var(--text-primary)] font-medium">
              <span className="text-[var(--accent)]">Compatibility Score:</span>{" "}
              {`${selectedFeedback.rating} %`}
            </p>
            <div className="relative group">
              <svg
                className="h-5 w-5 text-[var(--text-secondary)] cursor-pointer"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
                ></path>
              </svg>
              <div className="absolute z-10 left-6 top-0 hidden group-hover:block bg-[var(--surface)] text-[var(--text-secondary)] text-sm p-2 rounded shadow-lg border border-[var(--border)]">
                The overall compatibility score of the candidate.
              </div>
            </div>
          </div>

          <div className="p-3 bg-[var(--dark-bg)] rounded-lg border border-[var(--border)]">
            <h3 className="text-[var(--text-primary)] font-medium mb-4">
              Match
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-[var(--surface)] rounded-lg border border-[var(--border)] flex items-center justify-between">
                <p className="text-[var(--text-primary)]">
                  <span className="text-[var(--text-secondary)]">
                    Job Description Match:
                  </span>{" "}
                  {/* {`${selectedFeedback.jd_skill_match.toFixed(2)}%`} */}
                </p>
                <div className="relative group">
                  <svg
                    className="h-5 w-5 text-[var(--text-secondary)] cursor-pointer"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
                    ></path>
                  </svg>
                  <div className="absolute z-10 left-6 top-0 hidden group-hover:block bg-[var(--surface)] text-[var(--text-secondary)] text-sm p-2 rounded shadow-lg border border-[var(--border)]">
                    The match percentage based on the job description skills.
                  </div>
                </div>
              </div>
              <div className="p-3 bg-[var(--surface)] rounded-lg border border-[var(--border)] flex items-center justify-between">
                <p className="text-[var(--text-primary)]">
                  <span className="text-[var(--text-secondary)]">
                    Role Clarity Document:
                  </span>{" "}
                  {/* {`${selectedFeedback.rcd_skill_match.toFixed(2)}%`} */}
                </p>
                <div className="relative group">
                  <svg
                    className="h-5 w-5 text-[var(--text-secondary)] cursor-pointer"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
                    ></path>
                  </svg>
                  <div className="absolute z-10 left-6 top-0 hidden group-hover:block bg-[var(--surface)] text-[var(--text-secondary)] text-sm p-2 rounded shadow-lg border border-[var(--border)]">
                    The match percentage based on the role clarity document
                    given with job description.
                  </div>
                </div>
              </div>
            </div>
            <div className="p-3 bg-[var(--surface)] rounded-lg border border-[var(--border)] flex items-center justify-between mt-4">
              <p className="text-[var(--text-primary)]">
                <span className="text-[var(--text-secondary)]">
                  Experience Match:
                </span>{" "}
                <span
                  className={
                    selectedFeedback.feedback_text?.experience_match
                      ? "text-green-400"
                      : "text-red-400"
                  }
                >
                  {selectedFeedback.feedback_text?.experience_match
                    ? "Yes"
                    : "No"}
                </span>
              </p>
              <div className="relative group">
                <svg
                  className="h-5 w-5 text-[var(--text-secondary)] cursor-pointer"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
                  ></path>
                </svg>
                <div className="absolute z-10 left-6 top-0 hidden group-hover:block bg-[var(--surface)] text-[var(--text-secondary)] text-sm p-2 rounded shadow-lg border border-[var(--border)]">
                  Indicates whether the candidate's experience matches the job
                  requirements.
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-[var(--dark-bg)] rounded-lg border border-[var(--border)] ">
            <div className="text-[var(--text-secondary)] mb-1 flex items-center">
              Recommendation
              <div className="relative group ml-2">
                <svg
                  className="h-5 w-5 text-[var(--text-secondary)] cursor-pointer"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
                  ></path>
                </svg>
                <div className="absolute z-10 left-6 top-0 hidden group-hover:block bg-[var(--surface)] text-[var(--text-secondary)] text-sm p-2 rounded shadow-lg border border-[var(--border)] ">
                  The system's recommendation based on the candidate's profile
                  skills and experience.
                </div>
              </div>
            </div>
            <p className="relative z-0 max-h-40 overflow-y-scroll text-[var(--text-primary)] scrollbar-thin scrollbar-thumb-[var(--border)] scrollbar-track-[var(--dark-bg)] shadow-inner rounded-lg p-4 bg-[var(--surface)] border border-[var(--border)]">
              {selectedFeedback?.feedback_text?.feedback}
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={closeModal}
            className="px-6 py-2 bg-[var(--accent)] text-[var(--dark-bg)] font-medium rounded-lg shadow hover:bg-[var(--accent-hover)] transition-all duration-300"
          >
            Close
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FeedbackModal;
