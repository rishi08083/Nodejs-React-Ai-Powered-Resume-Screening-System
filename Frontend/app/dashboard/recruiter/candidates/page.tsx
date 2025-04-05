"use client";
import React, { useState, useEffect, useMemo } from "react";
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
          [candidateId]: data.data[0].rating,
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

  return (
    <div className="w-full p-4 bg-[#0e151f] min-h-screen mt-17">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-[#ffffff]">
          Candidate List
        </h1>
        <p className="text-[#8b949e] mt-2">
          Search and manage candidates for your job postings.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 space-y-4 md:space-y-0">
        <input
          type="text"
          placeholder="Search by ID or Name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/2 p-3 border border-[#30363d] rounded-lg bg-[#1b222c] text-[#ffffff] focus:outline-none focus:ring-2 focus:ring-[#ffb300]"
        />
        <select
          className="w-full md:w-1/4 p-3 border border-[#30363d] rounded-lg bg-[#1b222c] text-[#ffffff] focus:outline-none focus:ring-2 focus:ring-[#ffb300]"
          value={selectedJob}
          onChange={(e) => setSelectedJob(e.target.value)}
        >
          <option value="" className="bg-[#1b222c] text-[#ffffff]">
            Select a Job
          </option>
          {jobs.map((job) => (
            <option
              key={job.id}
              value={job.id}
              className="bg-[#1b222c] text-[#ffffff]"
            >
              {job.title}
            </option>
          ))}
        </select>
      </div>

      {/* Candidate Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-[#1b222c] rounded-lg shadow-lg overflow-hidden border border-[#30363d]"
      >
        <table className="min-w-full table-auto border-collapse">
          <thead>
            <tr className="bg-[#252e3a] border-b border-[#30363d]">
              <th className="px-4 py-4 text-left text-sm font-semibold text-[#ffffff]">
                Candidate Name
              </th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-[#ffffff]">
                Email
              </th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-[#ffffff]">
                Contact
              </th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-[#ffffff]">
                Resume
              </th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-[#ffffff]">
                Compatibility
              </th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-[#ffffff]">
                Feedback
              </th>
            </tr>
          </thead>
          <tbody>
            {currentCandidates.map((candidate, index) => (
              <motion.tr
                key={candidate.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="border-b border-[#30363d] hover:bg-[#252e3a] transition-colors duration-200"
              >
                <td className="px-4 py-4 text-sm font-medium text-[#ffffff]">
                  {candidate.name}
                </td>
                <td className="px-4 py-4 text-sm text-[#8b949e]">
                  {candidate.email}
                </td>
                <td className="px-4 py-4 text-sm text-[#8b949e]">
                  {candidate.phone_number}
                </td>
                <td className="px-4 py-4 text-sm">
                  <a
                    href={candidate.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#ffb300] underline hover:text-[#ffc133]"
                  >
                    View Resume
                  </a>
                </td>
                <td className="px-4 py-4 text-sm text-[#8b949e]">
                  {compatibilityResponses[candidate.id] ? (
                    <span>{compatibilityResponses[candidate.id]}</span>
                  ) : (
                    <button
                      onClick={() => handleCheckCompatibility(candidate.id)}
                      className="px-3 py-1 bg-[#ffb300] text-[#0e151f] rounded-lg shadow hover:bg-[#ffc133]"
                    >
                      Check Compatibility
                    </button>
                  )}
                </td>
                <td className="px-4 py-4 text-sm text-[#8b949e]">
                  {feedbackData[candidate.id] ? (
                    <button
                      onClick={() => handleShowFeedback(candidate.id)}
                      className="px-3 py-1 bg-[#ffb300] text-[#0e151f] rounded-lg shadow hover:bg-[#ffc133]"
                    >
                      Show Feedback
                    </button>
                  ) : (
                    <span>No Feedback</span>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* Pagination */}
      <div className="flex justify-center space-x-2 mt-6">
        {[
          ...Array(
            Math.ceil(filteredCandidates.length / candidatesPerPage)
          ).keys(),
        ].map((number) => (
          <motion.button
            key={number + 1}
            onClick={() => paginate(number + 1)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-2 rounded-lg shadow-md ${
              currentPage === number + 1
                ? "bg-[#ffb300] text-[#0e151f]"
                : "bg-[#1b222c] text-[#ffffff] hover:bg-[#252e3a]"
            }`}
          >
            {number + 1}
          </motion.button>
        ))}
      </div>

      {/* Feedback Modal */}
      {isModalOpen && selectedFeedback && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-[#0e151f] bg-opacity-90 flex items-center justify-center z-50"
        >
          <div className="bg-[#1b222c] rounded-lg shadow-lg p-6 w-1/2 border border-[#30363d]">
            <h2 className="text-xl font-bold text-[#ffffff] mb-4">
              Candidate Feedback
            </h2>
            <p className="text-[#8b949e]">
              <strong className="text-[#ffffff]">Combined Score:</strong>{" "}
              {selectedFeedback.Combined_Score}
            </p>
            <p className="text-[#8b949e]">
              <strong className="text-[#ffffff]">JD Skill Match:</strong>{" "}
              {selectedFeedback.JD_Skill_Match}
            </p>
            <p className="text-[#8b949e]">
              <strong className="text-[#ffffff]">RCD Skill Match:</strong>{" "}
              {selectedFeedback.RCD_Skill_Match}
            </p>
            <p className="text-[#8b949e]">
              <strong className="text-[#ffffff]">Experience Match:</strong>{" "}
              {selectedFeedback.feedback.experience_match ? "Yes" : "No"}
            </p>
            <p className="text-[#8b949e]">
              <strong className="text-[#ffffff]">Recommendation:</strong>{" "}
              {selectedFeedback.feedback.recommendation}
            </p>
            <button
              onClick={closeModal}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600"
            >
              Close
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default React.memo(CandidateList);
