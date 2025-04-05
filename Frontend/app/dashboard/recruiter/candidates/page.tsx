// /candidates/page.tsx
"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  ChangeEvent,
} from "react";
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
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const candidatesPerPage = 10;

  const fileTypes = ["pdf", "docx", "jpg", "jpeg"];
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
        // Remove the deleted candidate from the state
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
      // Show loading state for compatibility check
      setCompatibilityResponses((prev) => ({
        ...prev,
        [candidateId]: "Loading...", // Indicate loading for this candidate
      }));

      // Call the backend API to check compatibility
      const response = await fetch(`${BASE_URL}/screening/screen_candidate`, {
        method: "POST", // Assuming it's a POST request
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify({
          candidate_id: candidateId, // send the candidate_id in the request body
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

      // Handle error state for compatibility check
      setCompatibilityResponses((prev) => ({
        ...prev,
        [candidateId]: "Error checking compatibility", // Indicate error
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

  // Close dropdown when clicked outside
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

  useEffect(() => {
    if (isLoading) {
      const timer = setInterval(() => {
        setUploadProgress((prevProgress) => {
          const newProgress = prevProgress + 5;
          return newProgress >= 95 ? 95 : newProgress;
        });
      }, 300);

      return () => {
        clearInterval(timer);
        setUploadProgress(0);
      };
    }
  }, [isLoading]);

  return (
    <div className="w-full p-6 bg-[#0e151f] mt-14 min-h-screen text-[#ffffff] transition-all duration-300">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-[#ffffff] mb-2">
          Candidate List
        </h1>
        <div className="h-1 w-24 bg-[#ffb300] rounded-full mb-4"></div>
        <p className="text-[#8b949e] mt-2">
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
            className="w-full p-3 pl-10 border rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-[#ffb300] bg-[#1b222c] border-[#30363d] text-[#ffffff] transition-all duration-300"
          />
          <svg
            className="absolute left-3 top-3.5 h-5 w-5 text-[#8b949e] group-hover:text-[#ffb300] transition-colors duration-300"
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
            className="w-full p-3 pl-4 border rounded-lg shadow-md appearance-none focus:outline-none focus:ring-2 focus:ring-[#ffb300] bg-[#1b222c] border-[#30363d] text-[#ffffff] transition-all duration-300"
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
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#8b949e]">
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

      {isUploadModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm"
          onClick={() => setIsUploadModalOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-[#1b222c] rounded-xl shadow-2xl p-6 w-full max-w-2xl border border-[#30363d]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-[#ffffff]">
                Upload Resumes
              </h2>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-[#8b949e] hover:text-[#ffb300] transition-colors duration-300"
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
                  ? "border-[#ffb300] bg-[#252e3a] scale-105"
                  : "border-[#30363d] hover:border-[#ffb300] hover:bg-[#252e3a]"
              }`}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
            >
              <div className="flex flex-col items-center justify-center">
                <span className="text-4xl mb-3">📁</span>
                <p className="text-[#8b949e] mb-2">Drag & drop resumes here</p>
                <p className="text-[#6e7681] mb-3">or</p>
                <input
                  type="file"
                  multiple={true}
                  accept=".pdf,.docx,.jpg,.jpeg"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-input"
                />
                <label htmlFor="file-input" className="cursor-pointer">
                  <button
                    type="button"
                    className="px-6 py-2 bg-[#ffb300] text-[#0e151f] rounded-lg hover:bg-[#ffc133] transform hover:-translate-y-1 transition-all duration-300 flex items-center"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <span className="mr-2">📂</span>
                    Select Resumes
                  </button>
                </label>
              </div>
              <p className="mt-4 text-xs text-[#6e7681]">
                Supported formats: PDF, DOCX, JPG
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
              <div className="mt-6 bg-[#252e3a] p-4 rounded-lg border border-[#30363d]">
                <h2 className="text-lg font-semibold mb-3 flex items-center text-white">
                  <span className="mr-2">📋</span>
                  Selected Resumes:
                </h2>
                <ul className="space-y-2">
                  {files.map((file, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between p-3 bg-[#1b222c] rounded border border-[#30363d] hover:border-[#ffb300] transition-all duration-200"
                    >
                      <div className="flex items-center">
                        <span className="text-xl mr-3">
                          {getFileIcon(file.name)}
                        </span>
                        <div>
                          <p className="text-white font-medium">{file.name}</p>
                          <p className="text-xs text-[#8b949e]">
                            {(file.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveFile(index)}
                        className="text-[#8b949e] hover:text-red-500 transition-colors duration-200"
                      >
                        ❌
                      </button>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className="mt-5 w-full px-6 py-3 bg-[#ffb300] text-[#0e151f] rounded-lg hover:bg-[#ffc133] transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center disabled:opacity-70 disabled:transform-none"
                  onClick={handleUploadResume}
                  disabled={isLoading}
                >
                  <span className="mr-2">📤</span>
                  Upload Resumes
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
        className="bg-[#1b222c] rounded-xl shadow-lg overflow-hidden border border-[#30363d]"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse">
            <thead>
              <tr className="bg-[#1f6feb33] border-b border-[#30363d]">
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#ffffff]">
                  Candidate Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#ffffff]">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#ffffff]">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#ffffff]">
                  Resume
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#ffffff]">
                  Compatibility (%)
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#ffffff]">
                  Feedback
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#ffffff]">
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
                  className="border-b border-[#30363d] hover:bg-[#1f6feb33] transition-all duration-300"
                >
                  <td className="px-6 py-4 text-sm font-medium text-[#ffffff]">
                    {candidate.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#8b949e]">
                    {candidate.email}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#8b949e]">
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
                      className="text-[#ffb300] hover:text-[#ffc133] transition-colors duration-300 flex items-center gap-1"
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
                      <span className="bg-[#1f6feb33] text-[#ffffff] py-1 px-3 rounded-full">
                        {compatibilityResponses[candidate.id]}
                      </span>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleCheckCompatibility(candidate.id)}
                        className="px-4 py-2 bg-[#ffb300] text-[#0e151f] font-medium rounded-lg shadow hover:bg-[#ffc133] transition-colors duration-300"
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
                        className="px-4 py-2 border border-[#ffb300] text-[#ffb300] font-medium rounded-lg shadow hover:bg-[#ffb300] hover:text-[#0e151f] transition-all duration-300"
                      >
                        Show Feedback
                      </motion.button>
                    ) : (
                      <span className="text-[#8b949e]">No Feedback</span>
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
                        className="inline-flex justify-center rounded-md border border-[#30363d] shadow-sm px-3 py-1 bg-[#1b222c] text-sm font-medium text-[#ffffff] hover:bg-[#30363d] focus:outline-none transition-all duration-300"
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
                          className="absolute right-0 mt-2 w-36 rounded-md shadow-lg bg-[#1b222c] ring-1 ring-[#30363d] focus:outline-none z-50"
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
                              className="block w-full px-4 py-2 text-sm text-red-400 hover:bg-[#30363d] hover:text-red-300 transition-colors duration-300 text-left"
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
                ? "bg-[#ffb300] text-[#0e151f] font-medium"
                : "bg-[#1b222c] text-[#8b949e] border border-[#30363d] hover:border-[#ffb300] hover:text-[#ffb300]"
            }`}
          >
            {number + 1}
          </motion.button>
        ))}
      </motion.div>

      {/*  */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-[#ffffff] mb-2">
          Candidate List
        </h1>
        <div className="h-1 w-24 bg-[#ffb300] rounded-full mb-4"></div>
        <p className="text-[#8b949e] mt-2">
          Search and manage candidates for your job postings.
        </p>

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
              className="w-full p-3 pl-10 border rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-[#ffb300] bg-[#1b222c] border-[#30363d] text-[#ffffff] transition-all duration-300"
            />
            <svg
              className="absolute left-3 top-3.5 h-5 w-5 text-[#8b949e] group-hover:text-[#ffb300] transition-colors duration-300"
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
              className="w-full p-3 pl-4 border rounded-lg shadow-md appearance-none focus:outline-none focus:ring-2 focus:ring-[#ffb300] bg-[#1b222c] border-[#30363d] text-[#ffffff] transition-all duration-300"
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
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#8b949e]">
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
            className="px-4 py-2 bg-[#ffb300] text-[#0e151f] rounded-lg flex items-center hover:bg-[#ffc133] transition-all duration-300 disabled:bg-[#30363d] disabled:cursor-not-allowed disabled:text-[#6e7681]"
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
      </motion.div>

      {/* Feedback Modal */}
      {isModalOpen && selectedFeedback && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0  bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-[#1b222c] rounded-xl shadow-2xl p-8 w-full max-w-lg border border-[#30363d]"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#ffffff]">
                Candidate Feedback
              </h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={closeModal}
                className="text-[#8b949e] hover:text-[#ffb300] transition-colors duration-300"
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
              <div className="p-3 bg-[#1f6feb33] rounded-lg">
                <p className="text-[#ffffff] font-medium">
                  <span className="text-[#ffb300]">Combined Score:</span>{" "}
                  {selectedFeedback.Combined_Score}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-[#0e151f] rounded-lg border border-[#30363d]">
                  <p className="text-[#ffffff]">
                    <span className="text-[#8b949e]">JD Skill Match:</span>{" "}
                    {selectedFeedback.JD_Skill_Match}
                  </p>
                </div>
                <div className="p-3 bg-[#0e151f] rounded-lg border border-[#30363d]">
                  <p className="text-[#ffffff]">
                    <span className="text-[#8b949e]">RCD Skill Match:</span>{" "}
                    {selectedFeedback.RCD_Skill_Match}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-[#0e151f] rounded-lg border border-[#30363d]">
                <p className="text-[#ffffff]">
                  <span className="text-[#8b949e]">Experience Match:</span>{" "}
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

              <div className="p-4 bg-[#0e151f] rounded-lg border border-[#30363d]">
                <p className="text-[#8b949e] mb-1">Recommendation:</p>
                <p className="text-[#ffffff]">
                  {selectedFeedback.feedback.recommendation}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={closeModal}
                className="px-6 py-2 bg-[#ffb300] text-[#0e151f] font-medium rounded-lg shadow hover:bg-[#ffc133] transition-all duration-300"
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
