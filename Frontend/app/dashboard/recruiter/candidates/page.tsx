"use client";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import axios from "axios";

import FeedbackModal from "./FeedbackModal";
import CandidateTable from "./CandidateTable";
import SearchFilter from "./SearchFilter";
import { withRole } from "../../../../components/withRole";

import { useJobs, useCandidates } from "../../../../hooks";
import { useData } from "../../../../lib/dataContext";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

type Job = {
  id: string;
  title: string;
};

type experience_info = {
  "Required Experience": string;
  "Candidate Experience": string;
  "Experience Range Check": string;
};

export type Feedback = {
  rating: number;
  experience_match?: boolean;
  recommendation?: string;
  feedback?: string;
  jd_mismatch?: string[];
  rcd_mismatch?: string[];
  jd_match?: string[];
  rcd_match?: string[];
  experience_info:
    | {
        required_experience: string;
        candidate_experience: string;
        experience_range_check: string;
      }
    | string;
};

export type Candidate = {
  isRescreening: boolean;
  screeningError: any;
  freshlyScreened: any;
  id: string;
  name: string;
  email: string;
  phone_number: string;
  resume_url: string;
  is_screened: boolean;
  status: string;
  match_score: number | null;
  feedback?: Feedback;
  is_recommended: string;
};

const CandidateList = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(
    null
  );
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const candidatesPerPage = 10;

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState("");
  const [selectedRecommendation, setSelectedRecommendation] = useState("");
  const { jobs, isLoading: jobsLoading, refreshJobs } = useJobs();
  const {
    candidates,
    originalCandidates,
    isLoading: candidatesLoading,
    refreshCandidates,
    setcandidates,
  } = useCandidates(selectedJob);
  const { refreshData } = useData();

  const handleRefresh = () => {
    refreshJobs();
    if (selectedJob) {
      refreshCandidates();
    }
  };

  // Handle job selection change
  const handleJobChange = (e) => {
    // Handle both direct string values and event objects
    const jobId = typeof e === "object" && e.target ? e.target.value : e;

    if (jobId) {
      setSelectedJob(jobId);
      setSelectedRecommendation("");
      setCurrentPage(1);
    }
  };

  const handleRecommendationChange = (e) => {
    setSelectedRecommendation(e.target.value);

    if (e.target.value === "") {
      setcandidates(originalCandidates);
    } else {
      setcandidates(
        originalCandidates.filter(
          (candidate) =>
            candidate.is_recommended ===
            (e.target.value === "YES" ? true : false)
        )
      );
    }
  };

  // When a candidate is deleted, we should refresh the analytics too
  const handleCandidateDeleted = () => {
    refreshCandidates();
    refreshData("analytics");
  };

  // When screening is completed, update analytics
  const handleScreeningCompleted = () => {
    refreshCandidates();
    refreshData("analytics");
    refreshData("screeningResults");
  };

  const fetchCandidateFeedback = async (candidateId: string) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/screening/get_feedback/${candidateId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );

      const data = response.data;

      // Check if data exists and is an object with feedback details
      if (data.data) {
        const payload = data.data;

        // console.log("Feedback data:", payload);
        setSelectedFeedback({
          ...payload,
          experience_info: payload.experience_info,
        });
        setIsFeedbackModalOpen(true);
      }
    } catch (error: any) {
      if (error.response && error.response.data) {
        console.error("Error fetching feedback:", error.response.data.message);
      } else {
        console.error("Error fetching feedback:", error.message);
      }
    }
  };

  const filteredCandidates = useMemo(() => {
    if (!candidates || candidates.length === 0) {
      return [];
    }

    return candidates.filter((candidate) => {
      // Make search case-insensitive
      const searchTermLower = searchTerm.toLowerCase().trim();

      // If search term is empty, return all candidates
      if (!searchTermLower) {
        return true;
      }

      // Check if name contains search term
      const nameMatch =
        candidate.name &&
        candidate.name.toLowerCase().includes(searchTermLower);

      // Check if email contains search term
      const emailMatch =
        candidate.email &&
        candidate.email.toLowerCase().includes(searchTermLower);

      // Return true if either name or email matches
      return nameMatch || emailMatch;
    });
  }, [candidates, searchTerm]);

  const indexOfLastCandidate = currentPage * candidatesPerPage;
  const indexOfFirstCandidate = indexOfLastCandidate - candidatesPerPage;
  const currentCandidates = filteredCandidates.slice(
    indexOfFirstCandidate,
    indexOfLastCandidate
  );

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

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

  const handleShowFeedback = (candidate: Candidate) => {
    fetchCandidateFeedback(candidate.id);
    setIsOpen(null);
  };

  const closeModal = () => {
    setIsFeedbackModalOpen(false);
    setSelectedFeedback(null);
  };

  return (
    <div className="w-full p-6 bg-[var(--bg)] mt-14 min-h-screen text-[var(--text-primary)] transition-all duration-300">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-2">
          Screened Candidates
        </h1>
        <div className="h-1 w-24 bg-[var(--accent)] rounded-full mb-4"></div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-[var(--text-secondary)]">
        Find and manage candidates for your job openings.
          </p>
          <button
        onClick={() => handleRefresh()}
        className="px-4 py-2 rounded-lg shadow-md transition-all duration-300 bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)] flex items-center gap-2"
        aria-label="Refresh Candidates"
          >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 2v6h-6"></path>
          <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
          <path d="M3 22v-6h6"></path>
          <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
        </svg>
        Refresh
          </button>
        </div>
      </motion.div>

      {/* Search, Filter, and Recommendation Filter */}
      <SearchFilter
        jobs={jobs}
        setCandidates={setcandidates}
        originalCandidates={originalCandidates}
        selectedJob={selectedJob}
        setSearchTerm={setSearchTerm}
        setIsUploadModalOpen={setIsUploadModalOpen}
        searchTerm={searchTerm}
        selectedRecommendation={selectedRecommendation}
        setSelectedJob={setSelectedJob}
        handleJobChange={handleJobChange}
        setSelectedRecommendation={setSelectedRecommendation}
      />

      <CandidateTable
        handleShowFeedback={handleShowFeedback}
        candidates={filteredCandidates}
        setCandidates={setcandidates}
        setOriginalCandidates={() => refreshCandidates()}
        selectedJob={selectedJob}
        onCandidateDeleted={handleCandidateDeleted}
        onScreeningCompleted={handleScreeningCompleted}
        isLoading={candidatesLoading}
      />

      {/* Pagination - Only show if we have candidates */}
      {currentCandidates.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex justify-center items-center space-x-4 mt-8"
        >
          {/* Previous Button */}
          <motion.button
            onClick={() => paginate(currentPage - 1)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-lg shadow-md transition-all duration-300 ${
              currentPage === 1
                ? "bg-[var(--surface)] text-[var(--text-secondary)] cursor-not-allowed opacity-50"
                : "bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
            }`}
          >
            Previous
          </motion.button>

          {/* Page Numbers */}
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
                  ? "bg-[var(--accent)] text-[var(--dark-bg)] font-medium scale-110"
                  : "bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
              }`}
            >
              {number + 1}
            </motion.button>
          ))}

          {/* Next Button */}
          <motion.button
            onClick={() => paginate(currentPage + 1)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            disabled={
              currentPage ===
              Math.ceil(filteredCandidates.length / candidatesPerPage)
            }
            className={`px-4 py-2 rounded-lg shadow-md transition-all duration-300 ${
              currentPage ===
              Math.ceil(filteredCandidates.length / candidatesPerPage)
                ? "bg-[var(--surface)] text-[var(--text-secondary)] cursor-not-allowed opacity-50"
                : "bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
            }`}
          >
            Next
          </motion.button>
        </motion.div>
      )}

      {/* Feedback Modal */}
      {isFeedbackModalOpen && selectedFeedback && (
        <FeedbackModal
          selectedFeedback={selectedFeedback}
          closeModal={closeModal}
        />
      )}
    </div>
  );
};

export default withRole(CandidateList, ["recruiter"]);
