import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Candidate, Feedback } from "./page";

type FeedbackModalProps = {
  selectedFeedback: any;
  closeModal: () => void;
};

const FeedbackModal: React.FC<FeedbackModalProps> = ({
  selectedFeedback,
  closeModal,
}) => {
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

  // console.log("Selected Feedback:", selectedFeedback);

  // Parse JD match and mismatch skills
  const parseSkills = (skillsString: string) => {
    try {
      // Handle the string format with brackets and quotes
      if (skillsString.startsWith("[")) {
        return skillsString
          .replace(/^\[|\]$/g, "") // Remove starting [ and ending ]
          .split(",")
          .map((item) => item.trim().replace(/^'|'$/g, "")) // Remove quotes
          .filter((item) => item.length > 0);
      }
      return [skillsString];
    } catch (error) {
      console.error("Error parsing skills:", error);
      return [skillsString];
    }
  };

  const jdMatchSkills = selectedFeedback.jd_match
    ? selectedFeedback.jd_match
    : [];
  const jdMismatchSkills = selectedFeedback.jd_mismatch
    ? selectedFeedback.jd_mismatch
    : [];
  const rcdMatchSkills = selectedFeedback.rcd_match
    ? selectedFeedback.rcd_match
    : [];
  const rcdMismatchSkills = selectedFeedback.rcd_mismatch
    ? selectedFeedback.rcd_mismatch
    : [];

  // Calculate match percentages
  const jdMatchPercent = Math.round(selectedFeedback.jd_match_score) || 0;
  const rcdMatchPercent = Math.round(selectedFeedback.rcd_match_score) || 0;
  const overallMatchPercent = Math.round(selectedFeedback.rating) || 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/50"
      onClick={closeModal}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="bg-[var(--surface)] rounded-xl shadow-2xl p-8 w-full max-w-3xl border border-[var(--border)] max-h-[85vh] overflow-y-auto custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-[var(--border)]">
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">
              Candidate Screening Report
            </h2>
            <p className="text-[var(--text-secondary)] mt-1">
              Detailed analysis of candidate skills and experience
            </p>
          </div>
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

        {/* Summary Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
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
              Overall Recommedation
            </h3>
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                selectedFeedback.is_recommended === "YES"
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
              }`}
            >
              {selectedFeedback.is_recommended === "YES"
                ? "Recommended"
                : "Not Recommended"}
            </div>
          </div>

          {/* Compatibility Score Card */}
          <div className="bg-[var(--blue-highlight)] rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[var(--text-secondary)] text-sm">
                  Screening Score
                </p>
                <p className="text-3xl font-bold text-[var(--text-primary)]">
                  {overallMatchPercent}%
                </p>
              </div>
              <div className="w-24 h-24 relative flex items-center justify-center">
                <svg
                  viewBox="0 0 36 36"
                  className="absolute inset-0 w-full h-full"
                >
                  <path
                    className="stroke-current text-[var(--border)]"
                    fill="none"
                    strokeWidth="3"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    strokeDasharray="100, 100"
                  />
                  <path
                    className={`stroke-current ${
                      overallMatchPercent >= 70
                        ? "text-green-400"
                        : overallMatchPercent >= 40
                          ? "text-yellow-400"
                          : "text-red-400"
                    }`}
                    fill="none"
                    strokeWidth="3"
                    strokeLinecap="round"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    strokeDasharray={`${overallMatchPercent}, 100`}
                  />
                </svg>
                <span className="text-[var(--text-primary)] text-3xl font-semibold">
                  {overallMatchPercent}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Experience Section*/}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Experience Analysis
            </h3>
          </div>

          <div className="bg-[var(--blue-highlight)] rounded-lg p-5 border border-[var(--border)]">
            <div
              className={`flex items-center justify-center px-4 py-3 mb-4 rounded-lg ${
                selectedFeedback.experience_info.experience_range_check ===
                "meets"
                  ? "bg-green-100/20 text-green-500 border border-green-500/30 dark:bg-green-900/20"
                  : selectedFeedback.experience_info.experience_range_check ===
                      "below"
                    ? "bg-red-100/20 text-red-500 border border-red-500/30 dark:bg-red-900/20"
                    : selectedFeedback.experience_info
                          .experience_range_check === "exceeds"
                      ? "bg-blue-100/20 text-orange-500 border border-orange-500/30 dark:bg-orange-900/20"
                      : "bg-gray-100/20 text-gray-500 border border-gray-500/30 dark:bg-gray-900/20"
              }`}
            >
              <span className="font-medium">
                {selectedFeedback.experience_info.experience_range_check ===
                "meets"
                  ? "Candidate meets the required experience level"
                  : selectedFeedback.experience_info.experience_range_check ===
                      "below"
                    ? "Candidate does not meet the required experience level"
                    : selectedFeedback.experience_info
                          .experience_range_check === "exceeds"
                      ? "Candidate exceeds the required experience level"
                      : "Experience information unavailable"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-[var(--surface)] rounded-lg border border-[var(--border)]">
                <p className="text-sm text-[var(--text-secondary)] mb-1">
                  Required Experience
                </p>
                <p className="font-medium text-[var(--text-primary)]">
                  {selectedFeedback.experience_info.required_experience ||
                    "Not specified"}
                </p>
              </div>

              <div className="p-3 bg-[var(--surface)] rounded-lg border border-[var(--border)]">
                <p className="text-sm text-[var(--text-secondary)] mb-1">
                  Candidate Experience
                </p>
                <p
                  className={`font-medium ${
                    selectedFeedback.experience_info.experience_range_check ===
                    "meets"
                      ? "text-green-500"
                      : selectedFeedback.experience_info
                            .experience_range_check === "below"
                        ? "text-red-500"
                        : selectedFeedback.experience_info
                              .experience_range_check === "exceeds"
                          ? "text-orange-500"
                          : "text-[var(--text-primary)]"
                  }`}
                >
                  {selectedFeedback.experience_info.candidate_experience ||
                    "Not specified"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Skills Match Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* JD Skills Match */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                Job Description Skills
              </h3>
              <div className="text-sm font-medium text-[var(--text-primary)]">
                {jdMatchPercent}%
              </div>
            </div>
            <div className="h-2 bg-[var(--border)] rounded-full mb-4">
              <div
                className={`h-2 rounded-full ${
                  jdMatchPercent >= 70
                    ? "bg-green-400"
                    : jdMatchPercent >= 40
                      ? "bg-yellow-400"
                      : "bg-red-400"
                }`}
                style={{ width: `${jdMatchPercent}%` }}
              />
            </div>

            {jdMatchSkills.length > 0 && jdMatchSkills !== "none" ? (
              <div className="mb-3">
                <p className="text-sm font-medium text-green-400 mb-2">
                  Matching Skills:
                </p>
                <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto custom-scrollbar pr-2">
                  {jdMatchSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-green-100/10 text-green-400 text-xs px-2 py-1 rounded-full border border-green-500/30"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mb-3">
                <p className="text-sm font-medium text-red-400 mb-2">
                  No Matching skills found.
                </p>
              </div>
            )}

            {/* {jdMismatchSkills.length > 0 && (
              <div>
                <p className="text-sm font-medium text-red-400 mb-2">
                  Missing Skills:
                </p>
                <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto custom-scrollbar pr-2">
                  {jdMismatchSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-red-100/10 text-red-400 text-xs px-2 py-1 rounded-full border border-red-500/30"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )} */}
          </div>

          {/* RCD Skills Match */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                Role clarity Skills
              </h3>
              <div className="text-sm font-medium text-[var(--text-primary)]">
                {rcdMatchPercent}%
              </div>
            </div>
            <div className="h-2 bg-[var(--border)] rounded-full mb-4">
              <div
                className={`h-2 rounded-full ${
                  rcdMatchPercent >= 70
                    ? "bg-green-400"
                    : rcdMatchPercent >= 40
                      ? "bg-yellow-400"
                      : "bg-red-400"
                }`}
                style={{ width: `${rcdMatchPercent}%` }}
              />
            </div>

            {rcdMatchSkills.length > 0 && rcdMatchSkills !== "none" ? (
              <div className="mb-3">
                <p className="text-sm font-medium text-green-400 mb-2">
                  Matching Skills:
                </p>
                <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto custom-scrollbar pr-2">
                  {rcdMatchSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-green-100/10 text-green-400 text-xs px-2 py-1 rounded-full border border-green-500/30"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mb-3">
                <p className="text-sm font-medium text-red-400 mb-2">
                  No Matching skills found.
                </p>
              </div>
            )}

            {/* Uncomment if you want to show missing skills for RCD */}

            {/* {rcdMismatchSkills.length > 0 && (
              <div>
                <p className="text-sm font-medium text-red-400 mb-2">
                  Missing Skills:
                </p>
                <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto custom-scrollbar pr-2">
                  {rcdMismatchSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-red-100/10 text-red-400 text-xs px-2 py-1 rounded-full border border-red-500/30"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )} */}
          </div>
        </div>

        {/* Recommendation Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Summary
          </h3>
          <div className="p-4 bg-[var(--dark-bg)] rounded-lg border border-[var(--border)] max-h-60 overflow-y-auto custom-scrollbar">
            <p className="text-[var(--text-primary)]">
              {selectedFeedback.feedback}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 bg-[var(--surface-lighter)] text-[var(--text-primary)] rounded-lg border border-[var(--border)]"
            onClick={closeModal}
          >
            Close
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FeedbackModal;
