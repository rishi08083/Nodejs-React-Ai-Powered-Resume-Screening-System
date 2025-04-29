import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import ParseCandidate from "../../../../components/ParseCandidate";
import { AnimatePresence } from "framer-motion";
import { Dock, MousePointerClick, Search, UploadIcon, X } from "lucide-react";
import { useData } from "../../../../lib/dataContext";
import toastService from "../../../../utils/toastService";
import { useToastInit } from "../../../../hooks/useToastInit";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface UploadModalProps {
  jobs?: any[];
  closeModal: () => void;
  setIsUploadModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onUploadSuccess?: () => void;
}

type UploadedFile = {
  name: string;
  path: string; // URL or path to the file
  candidateId: string;
};
const UploadModal: React.FC<UploadModalProps> = ({
  jobs = [],
  closeModal,
  setIsUploadModalOpen,
  onUploadSuccess,
}) => {
  useToastInit();

  const { refreshData, setLoading } = useData();
  const fileTypes = ["pdf", "docx", "jpg", "jpeg"];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [successfullyUploadedFiles, setSuccessfullyUploadedFiles] = useState<
    UploadedFile[]
  >([]);
  const [viewParsedResume, setViewParsedResume] = useState<string | null>(null);
  const [parsedCandidates, setParsedCandidates] = useState<any[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Add missing state variables
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [jobsList, setJobs] = useState<any[]>(jobs || []);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [jobId, setJobId] = useState<string>("");
  const [JobTitle, setJobTitle] = useState<string>("");

  const getJobDetails = async () => {
    try {
      // Show loading state
      setLoading("jobs", true);

      const response = await fetch(`${BASE_URL}/api/job/view`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      if (response.ok) {
        const data = await response.json();
        setJobs(data.data);
        setIsLoading(false);

        // Refresh jobs data in context
        refreshData("jobs");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
    } catch (error) {
      console.error(error);
      toastService.error("Failed to load jobs. Please try again.");
    } finally {
      setLoading("jobs", false);
    }
  };

  useEffect(() => {
    if (errorMessage) {
      toastService.error(`⚠️ ${errorMessage}`);
    }
  }, [errorMessage]);

  useEffect(() => {
    const fetchJobDetails = async () => {
      await getJobDetails();
    };

    // Only fetch if jobs array is empty
    if (!jobs || jobs.length === 0) {
      fetchJobDetails();
    } else {
      setJobs(jobs);
    }
  }, []);

  const getFileExtension = (filename: string): string =>
    filename.split(".").pop()?.toLowerCase() || "";

  // Add a file limit constant at the top of your component
  const FILE_UPLOAD_LIMIT = 15;

  // Update your handleFile function to check against the limit
  const handleFile = (selectedFiles: FileList) => {
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    // Check if adding these files would exceed the limit
    if (files.length + selectedFiles.length > FILE_UPLOAD_LIMIT) {
      toastService.error(
        `Only ${FILE_UPLOAD_LIMIT} resumes are allowed at one time.`
      );
      // Optionally, you can still add files up to the limit
      const remainingSlots = FILE_UPLOAD_LIMIT - files.length;
      if (remainingSlots <= 0) return;

      // Only process files up to the remaining slots
      const filesToProcess = Array.from(selectedFiles).slice(0, remainingSlots);

      filesToProcess.forEach((file) => {
        const extension = getFileExtension(file.name);
        if (fileTypes.includes(extension)) {
          validFiles.push(file);
        } else {
          invalidFiles.push(file.name);
        }
      });
    } else {
      // Original logic when under the limit
      Array.from(selectedFiles).forEach((file) => {
        const extension = getFileExtension(file.name);
        if (fileTypes.includes(extension)) {
          validFiles.push(file);
        } else {
          invalidFiles.push(file.name);
        }
      });
    }

    if (invalidFiles.length > 0) {
      toastService.error(
        `Invalid file types: ${invalidFiles.join(", ")}. Please upload PDF, DOCX, or JPG, JPEG files.`
      );
    }

    setFiles((prevFiles) => [...prevFiles, ...validFiles]);
  };

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    handleFile(event.target.files);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    // toast.success("File removed successfully");
  };

  const handleOpenFile = (file: UploadedFile) => {
    let candidateId = file.candidateId;

    // Safety net: if candidateId missing or wrong, try to find it
    if (!candidateId || candidateId === "1") {
      const matched = parsedCandidates.find(
        (candidate) => candidate.fileName === file.name
      );
      candidateId = matched?.candidateId?.toString() || "";
    }

    if (candidateId) {
      setViewParsedResume(candidateId);
    } else {
      toastService.error("Candidate ID not found for this file.");
    }
  };

  const handleUploadResume = async () => {
    if (!selectedJob) {
      toastService.error("Please select a job before uploading resumes.");
      return;
    }

    if (files.length === 0) {
      const message = "No resumes selected for upload.";
      toastService.error(message);
      return;
    }

    // Set loading state in DataContext
    setLoading("candidates", true);
    setIsLoading(true);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      if (progress >= 90) clearInterval(interval);
      setUploadProgress(progress);
    }, 1000);

    const formData = new FormData();
    files.forEach((file) => formData.append("resume-files", file));
    formData.append("job_id", jobId);

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${BASE_URL}/api/upload/upload-resume`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      setUploadProgress(100);

      if (response.ok) {
        // Add successfully uploaded files to the list
        const responseData = await response.json();

        if (
          responseData.data &&
          Array.isArray(responseData.data.files) &&
          Array.isArray(responseData.data.candidates)
        ) {
          setParsedCandidates(responseData.data.candidates);

          // We only need the file name & path to display
          const uploadedFiles = responseData.data.candidates.map(
            (candidate: any) => ({
              name: candidate.fileName,
              path: candidate.fileUrl,
              candidateId: candidate.candidateId?.toString() || "",
            })
          );

          setSuccessfullyUploadedFiles((prev) => [...prev, ...uploadedFiles]);
        } else {
          // If API doesn't return file details, at least track the names
          const newUploadedFiles = files.map((file) => ({
            name: file.name,
            path: "#", // placeholder, can't know the actual path
            candidateId: "", // adding required candidateId property
          }));
          setSuccessfullyUploadedFiles((prev) => [
            ...prev,
            ...newUploadedFiles,
          ]);
        }

        setFiles([]);
        toastService.success("Files uploaded successfully.");

        // Reset file input after successful upload
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        // Refresh data in DataContext
        refreshData("candidates");
        refreshData("analytics");
        refreshData("parseResume");

        // Call onUploadSuccess callback if provided
        if (onUploadSuccess) {
          onUploadSuccess();
        }
      } else {
        const errorData = await response.json();

        const refineErrorMessage = (rawMsg: string): string => {
          if (rawMsg.includes("No text extracted from DOCX")) {
            return "We couldn't read the content of the uploaded DOCX file. Please check if the file is empty or corrupted.";
          }
          if (
            rawMsg.includes("no name") ||
            rawMsg.includes("no email") ||
            rawMsg.includes("no phone")
          ) {
            return "The resume is missing essential details like name, email, or phone number. Please upload a complete resume.";
          }
          return rawMsg;
        };

        const errorMsgList = errorData.errors.map(
          (error: { file: string; error: string }) => {
            const refined = refineErrorMessage(error.error);
            return `• ${error.file}: ${refined}`;
          }
        );

        const fullErrorMsg =
          `${errorData.message}\n\n${errorMsgList.join("\n")}` ||
          "Failed to upload the files.";
        toastService.error(fullErrorMsg);
      }
    } catch (error) {
      console.error(error);
      toastService.error(`${error}`);
    } finally {
      setIsLoading(false);
      clearInterval(interval);
      setUploadProgress(0);
      // Update loading state in DataContext
      setLoading("candidates", false);
    }
  };

  const getFileIcon = (filename: string) => {
    const ext = getFileExtension(filename);
    switch (ext) {
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm overflow-y-auto p-4"
      onClick={closeModal}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="bg-[var(--surface)] rounded-xl shadow-2xl p-6 w-full max-w-2xl border border-[var(--border)] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">
            Upload Resumes
          </h2>
          <button onClick={closeModal}>
            <X />
          </button>
        </div>

        {/* Job Dropdown */}
        <div className="relative mb-6" ref={dropdownRef}>
          <div
            className={`w-full p-3 pl-10 border-2 rounded-lg bg-[var(--surface)] border-[var(--border)] hover:border-[var(--accent)] cursor-pointer transition-all duration-300 flex justify-between items-center ${
              selectedJob
                ? "font-medium text-[var(--text-primary)]"
                : "text-[var(--text-secondary)]"
            }`}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className="flex items-center">
              <span className="absolute left-3 text-[var(--text-secondary)]">
                <MousePointerClick />
              </span>
              {JobTitle || "Select a Job"}
            </div>
            <span className="text-[var(--text-secondary)]">
              {isDropdownOpen ? "▲" : "▼"}
            </span>
          </div>

          {isDropdownOpen && (
            <div className="absolute z-10 w-full mt-1 bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-lg max-h-60 overflow-y-auto">
              <div
                className="p-3 hover:bg-[var(--surface-lighter)] cursor-pointer transition-colors duration-200 border-l-4 border-transparent text-[var(--text-secondary)]"
                onClick={() => {
                  setSelectedJob("");
                  setIsDropdownOpen(false);
                }}
              >
                Select a Job
              </div>
              {jobsList?.map((job, index) => (
                <div
                  key={index}
                  className={`p-3 hover:bg-[var(--surface-lighter)] cursor-pointer transition-colors duration-200 border-l-4 border-transparent ${
                    job.is_rcd_uploaded
                      ? "text-[var(--text-primary)] hover:border-[var(--accent)]"
                      : "text-[var(--text-secondary)] opacity-70"
                  }`}
                  onClick={() => {
                    if (job.is_rcd_uploaded && job.is_rcd_uploaded === true) {
                      setSelectedJob(job.id);
                      setJobTitle(job.title);
                      setJobId(job.id);
                      setIsDropdownOpen(false);
                    } else {
                      toastService.info(
                        "Please upload Role Clarity Document first for this job"
                      );
                    }
                  }}
                  title={
                    !job.is_rcd_uploaded
                      ? "Please upload Role Clarity Document first"
                      : ""
                  }
                >
                  <div className="flex justify-between items-center">
                    {job.title}
                    {!job.is_rcd_uploaded && (
                      <span className="text-xs text-[var(--text-muted)] ml-2 italic">
                        Needs RCD
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rest of your component remains unchanged */}
        {/* Drop Zone */}
        {/* Drop Zone */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
            isDragging
              ? "border-[var(--accent)] bg-[var(--blue-highlight)] scale-105"
              : files.length > FILE_UPLOAD_LIMIT
                ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20" // Visual cue when limit reached
                : "border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--blue-highlight)]"
          }`}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFile(e.dataTransfer.files);
          }}
          onDragOver={(e) => e.preventDefault()}
          onDragEnter={() => setIsDragging(true)}
          onDragLeave={() => setIsDragging(false)}
        >
          <span className="text-4xl mb-3">
            {files.length > FILE_UPLOAD_LIMIT ? "⚠️" : "📁"}
          </span>

          {files.length > FILE_UPLOAD_LIMIT ? (
            <p className="mb-2 text-orange-600 dark:text-orange-400 font-medium">
              File limit reached (15 maximum)
            </p>
          ) : (
            <>
              <p className="mb-2">Drag & drop resumes here</p>
              <p className="mb-3 text-[var(--text-muted)]">or</p>
            </>
          )}

          <input
            type="file"
            multiple
            accept=".pdf,.docx,.jpg,.jpeg"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            id="file-input"
            disabled={files.length >= FILE_UPLOAD_LIMIT}
          />

          <button
            className={`px-6 py-2 rounded ${
              files.length >= FILE_UPLOAD_LIMIT
                ? "bg-gray-400 cursor-not-allowed text-white"
                : "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]"
            }`}
            onClick={() =>
              files.length < FILE_UPLOAD_LIMIT && fileInputRef.current?.click()
            }
            disabled={files.length >= FILE_UPLOAD_LIMIT}
          >
            <span className="mr-2">📂</span>
            {files.length === 1 ? "Select Resume" : "Select Resumes"}
          </button>

          <p className="mt-4 text-sm text-[var(--text-muted)]">
            Supported formats: PDF, DOCX, JPG, JPEG files only
            <span className="ml-1 font-medium">
              (Max {FILE_UPLOAD_LIMIT} files)
            </span>
          </p>
        </div>

        {/* Uploaded files grid display */}
        {successfullyUploadedFiles.length > 0 && (
          <div className="mt-6 border border-[var(--border)] rounded-lg">
            <div className="bg-[var(--surface)] border-b border-[var(--border)] px-4 py-3 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-[var(--accent)]"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
              </svg>
              <h3 className="text-base font-medium text-[var(--text-primary)]">
                Processed Files ({successfullyUploadedFiles.length})
              </h3>
            </div>

            <div className="p-3 bg-[var(--surface-secondary)]">
              <div className="max-h-56 overflow-y-auto pr-1">
                <table className="min-w-full">
                  <thead>
                    <tr className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">
                      <th className="px-3 py-2 text-left">Name</th>
                      <th className="px-3 py-2 text-left">Type</th>
                      <th className="px-3 py-2 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {successfullyUploadedFiles.map((file, index) => (
                      <tr
                        key={index}
                        className="bg-[var(--surface)] hover:bg-[var(--blue-highlight)] transition-colors duration-200 cursor-pointer"
                        onClick={() => handleOpenFile(file)}
                      >
                        <td className="px-3 py-2 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-xl mr-2">
                              {getFileIcon(file.name)}
                            </span>
                            <span
                              className="text-sm font-medium truncate max-w-[150px]"
                              title={file.name}
                            >
                              {file.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-[var(--text-secondary)]">
                          {file.name.split(".").pop()?.toUpperCase()}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                          <button
                            className="text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenFile(file);
                            }}
                          >
                            View Parsed Resume
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        <AnimatePresence>
          {viewParsedResume && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-[1000] flex items-center justify-center bg-opacity-70 backdrop-blur-sm overflow-y-auto"
            >
              <div className="bg-[var(--surface)] rounded-lg shadow-lg p-6 w-full max-w-3xl h-[90vh] relative my-4 mx-auto overflow-y-auto">
                <button
                  onClick={() => setViewParsedResume(null)}
                  className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--surface-lighter)] hover:bg-[var(--bg)] p-2 rounded-full transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
                <ParseCandidate candidateId={viewParsedResume} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Files to be uploaded */}
        {files.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3 flex justify-between">
              <span>Selected Files</span>
              <span
                className={`text-sm font-normal ${
                  files.length > FILE_UPLOAD_LIMIT
                    ? "text-orange-500"
                    : "text-[var(--text-secondary)]"
                }`}
              >
                {files.length} of {FILE_UPLOAD_LIMIT} maximum
              </span>
            </h3>
            <ul className="space-y-2">
              {files.map((file, idx) => (
                <li
                  key={idx}
                  className="flex justify-between items-center border p-2 rounded"
                >
                  <span>
                    {getFileIcon(file.name)} {file.name}
                  </span>
                  <button onClick={() => handleRemoveFile(idx)}>
                    <X />
                  </button>
                </li>
              ))}
            </ul>

            <button
              type="button"
              className="mt-5 w-full px-6 py-3 bg-[var(--accent)] text-[var(--dark-bg)] rounded-lg hover:bg-[var(--accent-hover)] transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center disabled:opacity-70 disabled:transform-none"
              onClick={handleUploadResume}
              disabled={isLoading || files.length === 0}
            >
              <span className="mr-2">
                <UploadIcon />
              </span>
              {files.length === 1 ? "Upload Resume" : "Upload Resumes"}
            </button>

            {/* Full-screen Loading Overlay */}
            {isLoading && (
              <div
                className="fixed inset-0 bg-opacity-90 flex items-center justify-center z-[999]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-[var(--surface)] p-8 rounded-xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-105 border border-[var(--border)]">
                  <div className="flex flex-col items-center">
                    <div className="text-6xl mb-6 animate-bounce">⏳</div>
                    <h3 className="text-2xl font-bold text-[var(--accent)] mb-4">
                      Uploading Resumes
                    </h3>
                    <p className="text-[var(--text-secondary)] mb-6 text-center">
                      Please wait while we parse your resumes...
                    </p>

                    <div className="w-full bg-[var(--border)] rounded-full h-4 mb-3">
                      <div
                        className="bg-[var(--accent)] h-4 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-[var(--accent)] font-medium">
                      {uploadProgress}%
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default UploadModal;
