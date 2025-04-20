"use client";
import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  ChangeEvent,
} from "react";
import { motion } from "framer-motion";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import FeedbackModal from "./FeedbackModal";
import CandidateTable from "./CandidateTable";
import SearchFilter from "./SearchFilter";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

type Job = {
  id: string;
  title: string;
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
  experience_info: string;
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
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<string>("");

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [originalCandidates, setOriginalCandidates] = useState<Candidate[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedRecommendation, setSelectedRecommendation] = useState("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(
    null
  );
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const candidatesPerPage = 10;

  // File upload related states
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

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

          {
            data.data.length > 0 &&
              selectedJob === "" &&
              (() => {
                setSelectedJob(data.data[0].id);
                return null;
              })();
          }
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
        if (!selectedJob) {
          setCandidates([]);
          return;
        }
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
          if (data.data) {
            setOriginalCandidates(data.data.candidates);
            setCandidates(() => {
              if (selectedRecommendation === "") return data.data.candidates;
              return data.data.candidates.filter(
                (candidate) =>
                  candidate.is_recommended ===
                  selectedRecommendation.toUpperCase()
              );
            });
          } else {
            setCandidates([]);
            setOriginalCandidates([]);
          }
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message);
        }
      } catch (error) {
        console.log(error, "error");
      }
    };

    getCandidates();

    const intervalId = setInterval(() => {
      getCandidates();
    }, 6000);

    return () => clearInterval(intervalId);
  }, [selectedJob, selectedRecommendation]);

  const fetchCandidateFeedback = async (candidateId: string) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/screening/get_feedback/${candidateId}`,
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
        setSelectedFeedback(payload || {});
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
    return candidates.filter(
      (candidate) =>
        candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email.toString().includes(searchTerm)
    );
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
        <p className="text-[var(--text-secondary)] mt-2">
          Find and view candidates.
        </p>
      </motion.div>

      {/* Search, Filter, and Recommendation Filter */}
      <SearchFilter
        jobs={jobs}
        setCandidates={setCandidates}
        originalCandidates={originalCandidates}
        selectedJob={selectedJob}
        setSearchTerm={setSearchTerm}
        setIsUploadModalOpen={setIsUploadModalOpen}
        searchTerm={searchTerm}
        selectedRecommendation={selectedRecommendation}
        setSelectedJob={setSelectedJob}
        setSelectedRecommendation={setSelectedRecommendation}
      />

      {/* Candidate Table */}
      <CandidateTable
        currentCandidates={currentCandidates}
        selectedJob={selectedJob}
        setErrorMessage={setErrorMessage}
        setSuccessMessage={setSuccessMessage}
        handleShowFeedback={handleShowFeedback}
        setCandidates={setCandidates}
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

export default CandidateList;
