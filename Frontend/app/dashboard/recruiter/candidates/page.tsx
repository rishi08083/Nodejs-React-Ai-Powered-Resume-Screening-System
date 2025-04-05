"use client";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import {
  fetchJobs,
  fetchCandidates,
  checkCandidateCompatibility,
} from "../../../../api-services/CandidateServices";
import { log } from "console";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

type Job = {
  id: string;
  title: string;
};

type Candidate = {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  resume_url: string;
  compatibilityScore: number;
  feedback: {
    Combined_Score: number;
    JD_Skill_Match: number;
    RCD_Skill_Match: number;
    feedback: {
      experience_match: boolean;
      recommendation: string;
    };
  };
};

const CandidateList = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<string>("");
  const [resumeUrl, setResumeUrl] = useState<string>("");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [compatibilityResponses, setCompatibilityResponses] = useState<{
    [id: string]: string;
  }>({});
  const [feedbackData, setFeedbackData] = useState<{
    [id: string]: Candidate["feedback"];
  }>({});
  const [selectedFeedback, setSelectedFeedback] = useState<
    Candidate["feedback"] | null
  >(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const candidatesPerPage = 10;

  useEffect(() => {
    const getJobDetails = async () => {
      try {
        const response = await fetch(`${BASE_URL}/job/view`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        });

        if (response.ok) {
          const data = await response.json();
          setJobs(data.data);
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message);
        }
      } catch (error) {
        console.log(error, "error");
      }
    };
    getJobDetails();
  }, []);

  useEffect(() => {
    const getJobDetails = async () => {
      try {
        const response = await fetch(`${BASE_URL}/job/view`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        });

        if (response.ok) {
          const data = await response.json();
          setJobs(data.data);
          console.log(data.data, "data data");
          console.log(jobs, "jobs data");
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message);
        }
      } catch (error) {
        console.log(error, "error");
      }
    };
    getJobDetails();
  }, []);

  useEffect(() => {
    const getCandidates = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/candidates/list/${selectedJob}`,
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
          setCandidates(data.data.candidates);
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message);
        }
      } catch (error) {
        console.log(error, "error");
      }
    };
    getCandidates();
  }, [selectedJob]);

  const get_feedback = async (candidateId: string) => {
    try {
      const response = await fetch(
        `${BASE_URL}/screening/get_feedback/${candidateId}`,
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
        setCompatibilityResponses((prev) => ({
          ...prev,
          [candidateId]: data.data[0].rating || "0",
        }));
        setFeedbackData((prev) => ({
          ...prev,
          [candidateId]: data.data[0].feedback_text,
        }));
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const get_resume = async (candidateId: string, e) => {
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
        setResumeUrl(data.data.resume_url);
        window.open(data.data.resume_url, "_blank", "noopener,noreferrer");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

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
        setCandidates((prevCandidates) =>
          prevCandidates.filter((candidate) => candidate.id !== candidateId)
        );
        console.log("Candidate deleted successfully");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
    } catch (error) {
      console.error("Error deleting candidate:", error);
    }
  };

  const filteredCandidates = useMemo(() => {
    return candidates.filter(
      (candidate) =>
        candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.id.toString().includes(searchTerm)
    );
  }, [candidates, searchTerm]);

  const indexOfLastCandidate = currentPage * candidatesPerPage;
  const indexOfFirstCandidate = indexOfLastCandidate - candidatesPerPage;
  const currentCandidates = filteredCandidates.slice(
    indexOfFirstCandidate,
    indexOfLastCandidate
  );

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleCheckCompatibility = async (candidateId: string) => {
    try {
      setCompatibilityResponses((prev) => ({
        ...prev,
        [candidateId]: "Loading...",
      }));

      const response = await fetch(`${BASE_URL}/screening/screen_candidate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify({
          candidate_id: candidateId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data, "compatibility data");

        await get_feedback(candidateId);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
    } catch (error) {
      console.error("Error checking compatibility:", error);

      setCompatibilityResponses((prev) => ({
        ...prev,
        [candidateId]: "Error checking compatibility",
      }));
    }
  };

  const handleShowFeedback = (candidateId: string) => {
    setSelectedFeedback(feedbackData[candidateId]);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedFeedback(null);
  };

  const [isOpen, setIsOpen] = useState<string | null>(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(null);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="w-full p-6 bg-[var(--bg)] mt-14 min-h-screen text-[var(--text-primary)] transition-all duration-300">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-2">
          Candidate List
        </h1>
        <div className="h-1 w-24 bg-[var(--accent)] rounded-full mb-4"></div>
        <p className="text-[var(--text-secondary)] mt-2">
          Search and manage candidates for your job postings.
        </p>
      </motion.div>

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col md:flex-row items-center justify-between mb-8 space-y-4 md:space-y-0 md:space-x-4"
      >
        <div className="relative w-full md:w-1/2 group">
          <input
            type="text"
            placeholder="Search by ID or Name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 pl-10 border rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--accent)] bg-[var(--surface)] border-[var(--border)] text-[var(--text-primary)] transition-all duration-300"
          />
          <svg
            className="absolute left-3 top-3.5 h-5 w-5 text-[var(--text-secondary)] group-hover:text-[var(--accent)] transition-colors duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>
        </div>
        <div className="relative w-full md:w-1/3">
          <select
            className="w-full p-3 pl-4 border rounded-lg shadow-md appearance-none focus:outline-none focus:ring-2 focus:ring-[var(--accent)] bg-[var(--surface)] border-[var(--border)] text-[var(--text-primary)] transition-all duration-300"
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
          >
            <option value="">Select a Job</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[var(--text-secondary)]">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              ></path>
            </svg>
          </div>
        </div>
      </motion.div>

      {/* Candidate Table */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="bg-[var(--surface)] rounded-xl shadow-lg overflow-hidden border border-[var(--border)]"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse">
            <thead>
              <tr className="bg-[var(--accent)] border-b border-[var(--border)]">
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
                  Resume
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-primary)]">
                  Compatibility (%)
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-primary)]">
                  Feedback
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-primary)]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {currentCandidates.map((candidate, index) => (
                <motion.tr
                  key={candidate.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                  className="border-b border-[var(--border)] hover:bg-[var(--accent-hover)] transition-all duration-300"
                >
                  <td className="px-6 py-4 text-sm font-medium text-[var(--text-primary)]">
                    {candidate.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                    {candidate.email}
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                    {candidate.phone_number}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <motion.a
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        get_resume(candidate.id, e);
                      }}
                      href={resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors duration-300 flex items-center gap-1"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 13l-3 3m0 0l-3-3m3 3V8m0 13a9 9 0 110-18 9 9 0 010 18z"
                        ></path>
                      </svg>
                      View Resume
                    </motion.a>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {compatibilityResponses[candidate.id] ? (
                      <span className="bg-[var(--accent)] text-[var(--text-primary)] py-1 px-3 rounded-full">
                        {compatibilityResponses[candidate.id]}
                      </span>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleCheckCompatibility(candidate.id)}
                        className="px-4 py-2 bg-[var(--accent)] text-[var(--dark-bg)] font-medium rounded-lg shadow hover:bg-[var(--accent-hover)] transition-colors duration-300"
                      >
                        Check Compatibility
                      </motion.button>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {feedbackData[candidate.id] ? (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleShowFeedback(candidate.id)}
                        className="px-4 py-2 border border-[var(--accent)] text-[var(--accent)] font-medium rounded-lg shadow hover:bg-[var(--accent)] hover:text-[var(--dark-bg)] transition-all duration-300"
                      >
                        Show Feedback
                      </motion.button>
                    ) : (
                      <span className="text-[var(--text-secondary)]">
                        No Feedback
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm relative">
                    <div
                      ref={dropdownRef}
                      className="relative inline-block text-left"
                    >
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() =>
                          setIsOpen((prev) =>
                            prev === candidate.id ? null : candidate.id
                          )
                        }
                        className="inline-flex justify-center rounded-md border border-[var(--border)] shadow-sm px-3 py-1 bg-[var(--surface)] text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--border)] focus:outline-none transition-all duration-300"
                        aria-haspopup="true"
                        aria-expanded={isOpen === candidate.id}
                      >
                        &#x22EE;
                      </motion.button>

                      {isOpen === candidate.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 mt-2 w-36 rounded-md shadow-lg bg-[var(--surface)] ring-1 ring-[var(--border)] focus:outline-none z-50"
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
                                handleDeleteCandidate(candidate.id);
                                setIsOpen(null);
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
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Pagination */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="flex justify-center space-x-2 mt-8"
      >
        {[
          ...Array(
            Math.ceil(filteredCandidates.length / candidatesPerPage)
          ).keys(),
        ].map((number) => (
          <motion.button
            key={number + 1}
            onClick={() => paginate(number + 1)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`px-4 py-2 rounded-lg shadow-md transition-all duration-300 ${
              currentPage === number + 1
                ? "bg-[var(--accent)] text-[var(--dark-bg)] font-medium"
                : "bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
            }`}
          >
            {number + 1}
          </motion.button>
        ))}
      </motion.div>

      {/* Feedback Modal */}
      {isModalOpen && selectedFeedback && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0  flex items-center justify-center z-50 backdrop-blur-sm"
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
              <div className="p-3 bg-[var(--blue-highlight)] rounded-lg">
                <p className="text-[var(--text-primary)] font-medium">
                  <span className="text-[var(--accent)]">Combined Score:</span>{" "}
                  {selectedFeedback.Combined_Score}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-[var(--dark-bg)] rounded-lg border border-[var(--border)]">
                  <p className="text-[var(--text-primary)]">
                    <span className="text-[var(--text-secondary)]">
                      JD Skill Match:
                    </span>{" "}
                    {selectedFeedback.JD_Skill_Match}
                  </p>
                </div>
                <div className="p-3 bg-[var(--dark-bg)] rounded-lg border border-[var(--border)]">
                  <p className="text-[var(--text-primary)]">
                    <span className="text-[var(--text-secondary)]">
                      RCD Skill Match:
                    </span>{" "}
                    {selectedFeedback.RCD_Skill_Match}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-[var(--dark-bg)] rounded-lg border border-[var(--border)]">
                <p className="text-[var(--text-primary)]">
                  <span className="text-[var(--text-secondary)]">
                    Experience Match:
                  </span>{" "}
                  <span
                    className={
                      selectedFeedback.feedback.experience_match
                        ? "text-green-400"
                        : "text-red-400"
                    }
                  >
                    {selectedFeedback.feedback.experience_match ? "Yes" : "No"}
                  </span>
                </p>
              </div>

              <div className="p-4 bg-[var(--dark-bg)] rounded-lg border border-[var(--border)]">
                <p className="text-[var(--text-secondary)] mb-1">
                  Recommendation:
                </p>
                <p className="text-[var(--text-primary)]">
                  {selectedFeedback.feedback.recommendation}
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
      )}
    </div>
  );
};

export default React.memo(CandidateList);
