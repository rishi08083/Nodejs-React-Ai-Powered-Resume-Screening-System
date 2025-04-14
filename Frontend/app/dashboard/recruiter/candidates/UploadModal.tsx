import React, { ChangeEvent, useRef, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

type UploadModalProps = {
  closeModal: () => void;
  uploadProgress: number;
  isLoading: boolean;
  selectedJob: string | null;

  setUploadProgress: React.Dispatch<React.SetStateAction<number>>;
  setIsLoading : React.Dispatch<React.SetStateAction<boolean>>;
  setIsUploadModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setCandidates: React.Dispatch<React.SetStateAction<any[]>>;
};

const UploadModal: React.FC<UploadModalProps> = ({
  closeModal,
  selectedJob,
  isLoading,
  setIsLoading,
  uploadProgress,
  setUploadProgress,
  setIsUploadModalOpen,
  setCandidates,
}) => {
  const fileTypes = ["pdf", "docx", "jpg", "jpeg"];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);

  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const getFileExtension = (filename: string): string => {
    return filename.split(".").pop()?.toLowerCase() || "";
  };
  const handleFile = (selectedFiles: FileList) => {
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    Array.from(selectedFiles).forEach((file) => {
      // Check by extension instead of mime type to be more reliable
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
          ", "
        )}. Please upload PDF, DOCX, or JPG files.`
      );
    } else {
      setErrorMessage("");
    }

    setFiles((prevFiles) => [...prevFiles, ...validFiles]); // Append new files to the existing list
  };

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    if (event.target.files === null) return;
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      handleFile(selectedFiles);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear the input after selection
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    toast.success("File removed successfully", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
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
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      if (progress >= 90) {
        clearInterval(interval);
      }
      setUploadProgress(progress);
    }, 500);

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

          toast.success("Resumes uploaded successfully", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });

          // close the modal after successful upload
          setIsUploadModalOpen(false);

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
        console.log(data);
        setTimeout(() => {
          setErrorMessage(data.message  || "Failed to upload the resumes.");
          setIsLoading(false);
        }, 500);
      }
    } catch (error) {
      console.error("Error uploading resumes:", error);
      setErrorMessage("An error occurred while uploading the resumes.");
      setIsLoading(false);
    }
  };

  return (
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
            <p className="text-[var(--text-secondary)] mb-2">
              Drag & drop resumes here
            </p>
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
                className="px-6 py-2 bg-[var(--accent)] text-[var(--dark-bg)] rounded-lg hover:bg-[var(--accent-hover)] transform  transition-all duration-300 flex items-center"
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
          <div className="mt-4 p-4 bg-green-900 bg-opacity-20 text-green-400 rounded-lg border border-green-500 animate-pulse">
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
                      <p className="text-[var(--text-primary)] font-medium">
                        {file.name}
                      </p>
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
                  <svg
                    className="animate-spin mr-2 h-5 w-5"
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
  );
};

export default UploadModal;
