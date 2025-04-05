import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
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

const UploadForm = () => {
  const fileTypes = ["pdf", "docx", "jpg", "jpeg"];
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
  
  // Resume upload state
  const [files, setFiles] = useState<File[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  
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
      if (!selectedJob) return;
      
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

  // Simulate progress for loader
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

  const get_feedback = async (candidateId: string) => {
    try {
      const response = await fetch(`${BASE_URL}/screening/get_feedback/${candidateId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });

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
  
  // Resume upload functionality
  const getFileExtension = (filename: string): string => {
    return filename.split(".").pop()?.toLowerCase() || "";
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
        `Invalid file types: ${invalidFiles.join(
          ", ",
        )}. Please upload PDF, DOCX, or JPG files.`,
      );
    } else {
      setErrorMessage("");
    }

    setFiles((prevFiles) => [...prevFiles, ...validFiles]);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      handleFile(selectedFiles);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!selectedJob) {
      setErrorMessage("Please select a job before uploading files.");
      return;
    }

    if (files.length === 0) {
      setErrorMessage("No files selected for upload.");
      return;
    }

    setIsLoading(true);
    setUploadProgress(0);

    const formData = new FormData();
    files.forEach((file) => formData.append("resume-files", file));
    formData.append("job_id", selectedJob);

    try {
      const response = await fetch(`${BASE_URL}/upload/upload-resume`, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: formData,
      });

      setUploadProgress(100);

      setTimeout(async () => {
        if (response.ok) {
          setFiles([]);
          setErrorMessage("");
          setSuccessMessage("Files uploaded successfully.");
          
          // Refresh candidates list
          const candidatesResponse = await fetch(
            `${BASE_URL}/candidates/list/${selectedJob}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem("token"),
              },
            },
          );
          
          if (candidatesResponse.ok) {
            const data = await candidatesResponse.json();
            setCandidates(data.data.candidates);
          }
          
          // Close the modal after 2 seconds
          setTimeout(() => {
            setShowUploadModal(false);
            setSuccessMessage(null);
          }, 2000);
        } else {
          const errorData = await response.json();
          setErrorMessage(errorData.message || "Failed to upload the files.");
        }
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error("Error uploading files:", error);
      setErrorMessage("An error occurred while uploading the files.");
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


  const [isOpen, setIsOpen] = useState<string | null>(null);
  const dropdownRef = useRef(null);

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
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


  // const [isOpen, setIsOpen] = useState<string | null>(null);
  // const dropdownRef = useRef(null);

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
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
    <div className="w-full p-4 bg-gray-50">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Candidate List
          </h1>
          <p className="text-gray-600 mt-2">
            Search and manage candidates for your job postings.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2 bg-yellow-400 text-white rounded-lg shadow-md hover:bg-yellow-500 transition-colors duration-200"
        >
          Upload Resumes
        </motion.button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 space-y-4 md:space-y-0">
        <input
          type="text"
          placeholder="Search by ID or Name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/2 p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
        <select
          className="w-full md:w-1/4 p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
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
      </div>

      {/* Candidate Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg shadow-lg overflow-hidden"
      >
        <table className="min-w-full table-auto border-collapse">
          <thead>
            <tr className="bg-yellow-50 border-b border-yellow-100">
              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">
                Candidate Name
              </th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">
                Email
              </th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">
                Contact
              </th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">
                Resume
              </th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">
                Compatibility (%)
              </th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">
                Feedback
              </th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">
                Actions
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
                className="border-b border-gray-100 hover:bg-yellow-50 transition-colors duration-200"
              >
                <td className="px-4 py-4 text-sm font-medium text-gray-800">
                  {candidate.name}
                </td>
                <td className="px-4 py-4 text-sm text-gray-600">
                  {candidate.email}
                </td>
                <td className="px-4 py-4 text-sm text-gray-600">
                  {candidate.phone_number}
                </td>
                <td className="px-4 py-4 text-sm">
                  <a
                    onClick={(e) => get_resume(candidate.id, e)}
                    href={resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-yellow-600 underline hover:text-yellow-800"
                  >
                    View Resume
                  </a>
                </td>
                <td className="px-4 py-4 text-sm text-gray-600">
                  {compatibilityResponses[candidate.id] ? (
                    <span>{compatibilityResponses[candidate.id]}</span>
                  ) : (
                    <button
                      onClick={() => handleCheckCompatibility(candidate.id)}
                      className="px-3 py-1 bg-yellow-400 text-white rounded-lg shadow hover:bg-yellow-500"
                    >
                      Check Compatibility
                    </button>
                  )}
                </td>
                <td className="px-4 py-4 text-sm text-gray-600">
                  {feedbackData[candidate.id] ? (
                    <button
                      onClick={() => handleShowFeedback(candidate.id)}
                      className="px-3 py-1 bg-yellow-400 text-white rounded-lg shadow hover:bg-yellow-500"
                    >
                      Show Feedback
                    </button>
                  ) : (
                    <span>No Feedback</span>
                  )}
                </td>
                <td className="px-4 py-4 text-sm text-gray-600 relative">
                  <div
                  ref={dropdownRef}
                  className="relative inline-block text-left"
                  >
                  <button
                    onClick={() => setIsOpen((prev) => (prev === candidate.id ? null : candidate.id))}
                    className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-3 py-1 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                    aria-haspopup="true"
                    aria-expanded={isOpen === candidate.id}
                  >
                    &#x22EE;
                  </button>

                    {isOpen === candidate.id && (
                    <div
                      className="absolute right-10 top-[-10px] mt-2 w-32 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-1000"
                      tabIndex={-1}
                      onClick={(e) => e.stopPropagation()}
                      style={{ zIndex: 1000 }}
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
                        className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                        role="menuitem"
                      >
                        Delete
                      </button>
                      </div>
                    </div>
                    )}
                  </div>
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
                ? "bg-yellow-400 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
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
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <div className="bg-white rounded-lg shadow-lg p-6 w-1/2">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Candidate Feedback
            </h2>
            <p className="text-gray-600">
              <strong>Combined Score:</strong> {selectedFeedback.Combined_Score}
            </p>
            <p className="text-gray-600">
              <strong>JD Skill Match:</strong> {selectedFeedback.JD_Skill_Match}
            </p>
            <p className="text-gray-600">
              <strong>RCD Skill Match:</strong>{" "}
              {selectedFeedback.RCD_Skill_Match}
            </p>
            <p className="text-gray-600">
              <strong>Experience Match:</strong>{" "}
              {selectedFeedback.feedback.experience_match ? "Yes" : "No"}
            </p>
            <p className="text-gray-600">
              <strong>Recommendation:</strong>{" "}
              {selectedFeedback.feedback.recommendation}
            </p>
            <button
              onClick={closeModal}
              className="mt-4 px-4 py-2 bg-red-400 text-white rounded-lg shadow hover:bg-red-500"
            >
              Close
            </button>
          </div>
        </motion.div>
      )}
      
      {/* Upload Resume Modal */}
      {showUploadModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Upload Resumes
              </h2>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setFiles([]);
                  setErrorMessage("");
                  setSuccessMessage(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            {/* Job Selection */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Select Job</label>
              <select
                className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
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
            </div>
            
            {/* Drag and Drop Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
                isDragging
                  ? "border-yellow-500 bg-yellow-50 scale-105"
                  : "border-gray-300 hover:border-yellow-500 hover:bg-yellow-50"
              }`}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
            >
              <div className="flex flex-col items-center justify-center">
                <span className="text-4xl mb-3">📁</span>
                <p className="text-gray-600 mb-2">Drag & drop files here</p>
                <p className="text-gray-500 mb-3">or</p>
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
                    className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transform hover:-translate-y-1 transition-all duration-300 flex items-center"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <span className="mr-2">📂</span>
                    Select Files
                  </button>
                </label>
              </div>
              <p className="mt-4 text-xs text-gray-500">
                Supported formats: PDF, DOCX, JPG, JPEG
              </p>
            </div>
            
            {/* Error Message */}
            {errorMessage && (
              <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 animate-pulse">
                <div className="flex items-center">
                  <span className="mr-2">⚠️</span>
                  {errorMessage}
                </div>
              </div>
            )}
            
            {/* Success Message */}
            {successMessage && (
              <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200">
                <div className="flex items-center">
                  <span className="mr-2">✅</span>
                  {successMessage}
                </div>
              </div>
            )}
            
            {/* Selected Files */}
            {files.length > 0 && (
              <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <span className="mr-2">📋</span>
                  Selected Files:
                </h3>
                <ul className="space-y-2 max-h-48 overflow-y-auto">
                  {files.map((file, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between p-3 bg-white rounded border border-gray-200 hover:border-yellow-300 transition-all duration-200"
                    >
                      <div className="flex items-center">
                        <span className="text-xl mr-3">{getFileIcon(file.name)}</span>
                        <div>
                          <p className="text-gray-800 font-medium">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveFile(index)}
                        className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                      >
                        ❌
                      </button>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className="mt-5 w-full px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center disabled:opacity-70 disabled:transform-none"
                  onClick={handleUpload}
                  disabled={isLoading}
                >
                  <span className="mr-2">📤</span>
                  Upload Files
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
      
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-105">
            <div className="flex flex-col items-center">
              <div className="text-6xl mb-6 animate-bounce">⏳</div>
              <h3 className="text-2xl font-bold text-yellow-700 mb-4">
                Uploading Files
              </h3>
              <p className="text-gray-600 mb-6 text-center">
                Please wait while we process your files...
              </p>

              <div className="w-full bg-gray-200 rounded-full h-4 mb-3">
                <div
                  className="bg-yellow-500 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-yellow-600 font-medium">{uploadProgress}%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(UploadForm);