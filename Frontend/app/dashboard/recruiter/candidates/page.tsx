"use client";
import React, { useState, useEffect, useMemo, useRef, ChangeEvent } from "react";
import { motion } from "framer-motion";
import axios from "axios";
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
  is_recommended: string;
  match_score: number | null;
  is_screened: boolean;
  status: string;
  feedback?: {
    Combined_Score: number;
    JD_Skill_Match: number;
    RCD_Skill_Match: number;
    feedback: {
      experience_match: boolean;
      feedback: string;
      Feedback: string;
    };
    is_recommended?: string;
  };
};

const CandidateList = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<string>("");
  const [resumeUrl, setResumeUrl] = useState<string>("");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [originalCandidates, setOriginalCandidates] = useState<Candidate[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedRecommendation, setSelectedRecommendation] = useState("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [feedbackData, setFeedbackData] = useState<{
    [id: string]: Candidate["feedback"];
  }>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedFeedback, setSelectedFeedback] = useState<
    Candidate["feedback"] | null
  >(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const candidatesPerPage = 10;

  // File upload related states
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const fileTypes = ["pdf", "docx", "jpg", "jpeg"];
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const getFileExtension = (filename: string): string => {
    return filename.split(".").pop()?.toLowerCase() || "";
  };

  const handleFile = (selectedFiles: FileList) => {
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    Array.from(selectedFiles).forEach((file) => {
      const extension = getFileExtension(file.name);
      if (fileTypes.includes(extension)) {
        validFiles.push(file);
      } else {
        invalidFiles.push(file.name);
      }
    });

    if (invalidFiles.length > 0) {
      setErrorMessage(
        `Invalid file types: ${invalidFiles.join(", ")}. Please upload PDF, DOCX, or JPG files.`
      );
    } else {
      setErrorMessage("");
    }

    setFiles((prevFiles) => [...prevFiles, ...validFiles]);
  };

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      handleFile(selectedFiles);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const droppedFiles = event.dataTransfer.files;
    handleFile(droppedFiles);
  };

  const getFileIcon = (filename: string) => {
    const extension = getFileExtension(filename);
    switch (extension) {
      case "pdf":
        return "📄";
      case "docx":
        return "📝";
      case "jpg":
      case "jpeg":
        return "🖼️";
      default:
        return "📎";
    }
  };

  const handleUploadResume = async () => {
    if (!selectedJob) {
      setErrorMessage("Please select a job before uploading resumes.");
      return;
    }

    if (files.length === 0) {
      setErrorMessage("No resumes selected for upload.");
      return;
    }

    setIsLoading(true);
    setUploadProgress(0);

    const formData = new FormData();
    files.forEach((file) => formData.append("resume-files", file));
    formData.append("job_id", selectedJob);

    const apiUrl = `${BASE_URL}/upload/upload-resume`;
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      setUploadProgress(100);

      const data = await response.json();

      if (response.ok) {
        setTimeout(() => {
          setFiles([]);
          setErrorMessage("");
          setSuccessMessage("Resumes uploaded successfully.");

          const candidates = data?.data?.candidates;
          if (candidates && Array.isArray(candidates)) {
            setCandidates((prevCandidates) => [
              ...prevCandidates,
              ...candidates.filter(
                (candidate) => candidate && typeof candidate === "object"
              ),
            ]);
          } else {
            const refreshCandidates = async () => {
              try {
                const refreshResponse = await fetch(
                  `${BASE_URL}/candidates/list/${selectedJob}`,
                  {
                    method: "GET",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: "Bearer " + localStorage.getItem("token"),
                    },
                  }
                );
                if (refreshResponse.ok) {
                  const candidateData = await refreshResponse.json();
                  if (
                    candidateData?.data?.candidates &&
                    Array.isArray(candidateData.data.candidates)
                  ) {
                    setCandidates(candidateData.data.candidates);
                  } else {
                    console.log(
                      "No iterable candidates in refresh response:",
                      candidateData
                    );
                  }
                }
              } catch (refreshError) {
                console.log("Error refreshing candidates:", refreshError);
              }
            };
            if (selectedJob) {
              refreshCandidates();
            }
          }

          setIsLoading(false);
        }, 500);
      } else {
        setTimeout(() => {
          setErrorMessage(data.message || "Failed to upload the resumes.");
          setIsLoading(false);
        }, 500);
      }
    } catch (error) {
      console.error("Error uploading resumes:", error);
      setErrorMessage("An error occurred while uploading the resumes.");
      setIsLoading(false);
    }
  };

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

      console.log("Feedback fetched successfully", response.data.data);
      const data = response.data;

      // Check if data exists and is an array with at least one item
      if (data.data && Array.isArray(data.data) && data.data.length > 0) {
        const feedbackItem = data.data[0]; // Get the first feedback item
        const feedbackData = feedbackItem.feedback_text;

        setFeedbackData((prev) => ({
          ...prev,
          [candidateId]: feedbackData,
        }));
        setSelectedFeedback(feedbackData);
        setIsModalOpen(true);
      } else {
        alert("No feedback available for this candidate");
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

  const handleShowFeedback = (candidate: Candidate) => {
    if (feedbackData[candidate.id]) {
      setSelectedFeedback({
        ...feedbackData[candidate.id],
        is_recommended: candidate.is_recommended,
      });
      setIsModalOpen(true);
    } else {
      fetchCandidateFeedback(candidate.id).then(() => {
        setSelectedFeedback((prev) => ({
          ...prev,
          is_recommended: candidate.is_recommended,
        }));
      });
    }
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
          Screened Candidates
        </h1>
        <div className="h-1 w-24 bg-[var(--accent)] rounded-full mb-4"></div>
        <p className="text-[var(--text-secondary)] mt-2">
          Find and view candidates for job postings.
        </p>
      </motion.div>

      {/* Search, Filter, and Recommendation Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col md:flex-row items-center justify-between mb-8 space-y-4 md:space-y-0 md:space-x-4"
      >
        <div className="relative w-full md:w-1/3 group">
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
            onChange={(e) => {
              setSelectedJob(e.target.value);
              setCandidates(originalCandidates); // Reset candidates when job changes
            }}
          >
            <option value="" disabled>
              Select a Job
            </option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[var(--text-secondary)] bg-[var(--accent)] rounded-r-lg ">
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
        <div className="relative w-full md:w-1/6">
          <select
            className={`w-full p-2 pl-4 border rounded-lg shadow-md appearance-none focus:outline-none focus:ring-2 ${
              selectedJob
                ? "focus:ring-[var(--accent)] bg-[var(--surface)] border-[var(--border)] text-[var(--text-primary)]"
                : "bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed"
            } transition-all duration-300`}
            value={selectedRecommendation}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedRecommendation(value);

              if (value === "") {
                setCandidates(originalCandidates);
              } else {
                const filtered = originalCandidates.filter(
                  (candidate) =>
                    candidate.is_recommended === value.toUpperCase()
                );
                setCandidates(filtered);
              }
            }}
            disabled={!selectedJob} // Disable when no job is selected
          >
            <option value="">Recommendation</option>
            <option value="YES">Yes</option>
            <option value="NO">No</option>
          </select>

          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[var(--text-secondary)] bg-[var(--accent)] rounded-r-lg">
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
        <button
          type="button"
          className="px-4 py-2 bg-[var(--accent)] text-[var(--dark-bg)] rounded-lg flex items-center hover:bg-[var(--accent-hover)] transition-all duration-300 disabled:bg-[var(--border)] disabled:cursor-not-allowed disabled:text-[var(--text-secondary)]"
          onClick={() => setIsUploadModalOpen(true)}
          disabled={!selectedJob}
        >
          <svg
            className="h-5 w-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            ></path>
          </svg>
          Upload Resume
        </button>
      </motion.div>

      {isUploadModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0  bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm"
          onClick={() => setIsUploadModalOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-[var(--surface)] rounded-xl shadow-2xl p-6 w-full max-w-2xl border border-[var(--border)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                Upload Resumes
              </h2>
              <button
                onClick={() => setIsUploadModalOpen(false)}
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
              </button>
            </div>

            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
                isDragging
                  ? "border-[var(--accent)] bg-[var(--blue-highlight)] scale-105"
                  : "border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--blue-highlight)]"
              }`}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
            >
              <div className="flex flex-col items-center justify-center">
                <span className="text-4xl mb-3">📁</span>
                <p className="text-[var(--text-secondary)] mb-2">Drag & drop resumes here</p>
                <p className="text-[var(--text-muted)] mb-3">or</p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.docx,.jpg,.jpeg"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-input"
                />
                <label htmlFor="file-input" className="cursor-pointer">
                  <button
                    type="button"
                    className="px-6 py-2 bg-[var(--accent)] text-[var(--dark-bg)] rounded-lg hover:bg-[var(--accent-hover)] transform hover:-translate-y-1 transition-all duration-300 flex items-center"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <span className="mr-2">📂</span>
                    Select Resumes
                  </button>
                </label>
              </div>
              <p className="mt-4 text-xs text-[var(--text-muted)]">
                Supported formats: PDF, DOCX, Images
              </p>
            </div>

            {errorMessage && (
              <div className="mt-4 p-4 bg-red-900 bg-opacity-20 text-red-400 rounded-lg border border-red-500 animate-pulse">
                <div className="flex items-center">
                  <span className="mr-2">⚠️</span>
                  {errorMessage}
                </div>
              </div>
            )}
            {successMessage && (
              <div className="mt-4 p-4 bg-green-900 bg-opacity-20 text-green-400 rounded-lg border border-green-500">
                <div className="flex items-center">
                  <span className="mr-2">✔️</span>
                  {successMessage}
                </div>
              </div>
            )}

            {files.length > 0 && (
              <div className="mt-6 bg-[var(--blue-highlight)] p-4 rounded-lg border border-[var(--border)]">
                <h2 className="text-lg font-semibold mb-3 flex items-center text-[var(--text-primary)]">
                  <span className="mr-2">📋</span>
                  Selected Resumes:
                </h2>
                <ul className="space-y-2">
                  {files.map((file, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between p-3 bg-[var(--surface)] rounded border border-[var(--border)] hover:border-[var(--accent)] transition-all duration-200"
                    >
                      <div className="flex items-center">
                        <span className="text-xl mr-3">
                          {getFileIcon(file.name)}
                        </span>
                        <div>
                          <p className="text-[var(--text-primary)] font-medium">{file.name}</p>
                          <p className="text-xs text-[var(--text-secondary)]">
                            {(file.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveFile(index)}
                        className="text-[var(--text-secondary)] hover:text-red-500 transition-colors duration-200"
                      >
                        ❌
                      </button>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className="mt-5 w-full px-6 py-3 bg-[var(--accent)] text-[var(--dark-bg)] rounded-lg hover:bg-[var(--accent-hover)] transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center disabled:opacity-70 disabled:transform-none"
                  onClick={handleUploadResume}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading... {uploadProgress}%
                    </>
                  ) : (
                    <>
                      <span className="mr-2">📤</span>
                      Upload Resumes
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* Candidate Table */}
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
                    Resume
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-primary)]">
                    Compatibility (%)
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-primary)]">
                    Feedback
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-primary)]">
                    Recommended
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
                    className="border-b border-[var(--border)] hover:bg-[var(--bg)] transition-all duration-300"
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
                        <span>View</span>
                      </button>
                    </td>
                    {/* Compatibility Score */}
                    <td className="px-6 py-4 text-sm">
                      {candidate.match_score !== null &&
                      candidate.match_score !== undefined ? (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-4 py-2 bg-[var(--accent)] text-[var(--dark-bg)] font-medium rounded-lg shadow hover:bg-[var(--accent-hover)] transition-colors duration-300"
                        >
                          {candidate.match_score} %
                        </motion.button>
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
                    {/* Feedback Button */}
                    <td className="px-6 py-4 text-sm">
                      {candidate.match_score !== null &&
                      candidate.match_score !== undefined &&
                      candidate.is_screened ? (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleShowFeedback(candidate)}
                          className="px-4 py-2 border border-[var(--accent)] text-[var(--accent)] font-medium rounded-lg shadow hover:bg-[var(--accent)] hover:text-[var(--dark-bg)] transition-all duration-300"
                        >
                          Show Feedback
                        </motion.button>
                      ) : (
                        <span className="text-[var(--text-secondary)]">
                          {candidate.status === "parsed"
                            ? "Pending Feedback"
                            : "Not Available"}
                        </span>
                      )}
                    </td>

                    {/* Recommended */}
                    <td className="px-6 py-4 text-sm">
                      {candidate.is_recommended === "YES" ? (
                        <span className="text-green-400 font-medium">Yes</span>
                      ) : candidate.is_recommended === "NO" ? (
                        <span className="text-red-400 font-medium">No</span>
                      ) : (
                        <span className="text-yellow-400 font-medium">
                          Pending
                        </span>
                      )}
                    </td>

                    {/* Actions Dropdown */}
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

      {/* Pagination - Only show if we have candidates */}
      {currentCandidates.length > 0 && (
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
      )}

      {/* Feedback Modal */}
      {isModalOpen && selectedFeedback && (
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
                  <span className="text-[var(--accent)]">
                    Compatibility Score:
                  </span>{" "}
                  {`${selectedFeedback.Combined_Score.toFixed(2)}%`}
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
                      {`${selectedFeedback.JD_Skill_Match.toFixed(2)}%`}
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
                      {`${selectedFeedback.RCD_Skill_Match.toFixed(2)}%`}
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
                        selectedFeedback.feedback.experience_match
                          ? "text-green-400"
                          : "text-red-400"
                      }
                    >
                      {selectedFeedback.feedback.experience_match ? "Yes" : "No"}
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
                  <div className="relative group ml-2" >
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
                      The system's recommendation based on the candidate's
                      profile skills and experience.
                    </div>
                  </div>
                </div>
                <p className="relative z-0 max-h-40 overflow-y-scroll text-[var(--text-primary)] scrollbar-thin scrollbar-thumb-[var(--border)] scrollbar-track-[var(--dark-bg)] shadow-inner rounded-lg p-4 bg-[var(--surface)] border border-[var(--border)]">
                  {selectedFeedback.feedback.Feedback ||
                    selectedFeedback.feedback.feedback}
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