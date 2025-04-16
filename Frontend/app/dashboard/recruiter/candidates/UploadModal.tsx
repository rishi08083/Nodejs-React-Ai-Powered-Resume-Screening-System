import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import ParseCandidate from "../../../../components/ParseCandidate";
import { AnimatePresence } from "framer-motion";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

type UploadModalProps = {
  closeModal: () => void;
  setIsUploadModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

type UploadedFile = {
  name: string;
  path: string; // URL or path to the file
  candidateId: string;
};

const UploadModal: React.FC<UploadModalProps> = ({
  closeModal,
  setIsUploadModalOpen,
}) => {
  const fileTypes = ["pdf", "docx", "jpg", "jpeg"];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [jobs, setJobs] = useState<any[] | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [successfullyUploadedFiles, setSuccessfullyUploadedFiles] = useState<
    UploadedFile[]
  >([]);
  const [viewParsedResume, setViewParsedResume] = useState<string | null>(null);
  const [parsedCandidates, setParsedCandidates] = useState<any[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getJobDetails = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/job/view`,
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
        console.log(data);
        setJobs(data.data);
        console.log(data.data);
        setIsLoading(false);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    console.log(errorMessage);
    if (errorMessage) {
      toast.error(`⚠️ ${errorMessage}`);
    }
  }, [errorMessage]);

  useEffect(() => {
    const fetchJobDetails = async () => {
      await getJobDetails();
    };
    fetchJobDetails();
  }, []);

  const getFileExtension = (filename: string): string =>
    filename.split(".").pop()?.toLowerCase() || "";

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
      toast.error(
        `Invalid file types: ${invalidFiles.join(", ")}. Please upload PDF, DOCX, or JPG files.`
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
    toast.success("File removed successfully");
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
      console.log("📎 Opening parsed resume for candidate ID:", candidateId);
      setViewParsedResume(candidateId);
    } else {
      toast.error("Candidate ID not found for this file.");
    }
  };

  const handleUploadResume = async () => {
    if (!selectedJob) {
      const message = "Please select a job before uploading resumes.";
      toast.error(message);
      return;
    }

    if (files.length === 0) {
      const message = "No resumes selected for upload.";
      toast.error(message);
      return;
    }

    setIsLoading(true);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      if (progress >= 90) clearInterval(interval);
      setUploadProgress(progress);
    }, 500);

    const formData = new FormData();
    files.forEach((file) => formData.append("resume-files", file));
    formData.append("job_id", selectedJob);

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${BASE_URL}/upload/upload-resume`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      setUploadProgress(100);

      if (response.ok) {
        // Add successfully uploaded files to the list
        const responseData = await response.json();

        // Add the newly uploaded files to our state
        // This assumes your API returns information about the uploaded files
        // Adjust according to your actual API response structure
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
          console.log("✅ Uploaded with candidate IDs:", uploadedFiles);
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
        const successMsg = "Files uploaded successfully.";
        toast.success(successMsg);

        // Reset file input after successful upload
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
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
        toast.error(fullErrorMsg);
      }
    } catch (error) {
      console.error(error);
      toast.error(`${error}`);
    } finally {
      setIsLoading(false);
      clearInterval(interval);
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
      className="fixed inset-0 bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm overflow-y-auto"
      onClick={closeModal}
      style={{ maxHeight: "100vh" }}
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
          <button onClick={closeModal}>❌</button>
        </div>

        {/* Job Dropdown */}
        <div className="mb-4">
          <label className="block mb-2 text-[var(--text-primary)] font-medium">
            Select Job:
          </label>
          <select
            className="w-full p-2 rounded border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)]"
            value={selectedJob ?? ""}
            onChange={(e) => setSelectedJob(e.target.value)}
          >
            <option value="" disabled>
              -- Choose a job --
            </option>
            {jobs?.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
        </div>

        {/* Drop Zone */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
            isDragging
              ? "border-[var(--accent)] bg-[var(--blue-highlight)] scale-105"
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
          <p className="mb-2">Drag & drop resumes here</p>
          <p className="mb-3 text-[var(--text-muted)]">or</p>
          <input
            type="file"
            multiple
            accept=".pdf,.docx,.jpg,.jpeg"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            id="file-input"
          />
          <button
            className="px-6 py-2 bg-[var(--accent)] text-white rounded hover:bg-[var(--accent-hover)]"
            onClick={() => fileInputRef.current?.click()}
          >
            Select Resumes
          </button>
          <p className="mt-4 text-sm text-[var(--text-muted)]">
            Supported formats: PDF, DOCX, JPG
          </p>
        </div>

        {/* Uploaded files grid display */}
        {successfullyUploadedFiles.length > 0 && (
          <div className="mt-6 border border-[var(--border)] rounded-lg p-4 bg-[var(--surface-secondary)]">
            <h3 className="text-lg font-semibold mb-3 text-[var(--text-primary)]">
              Uploaded Files
            </h3>
            <div className="max-h-48 overflow-y-auto pr-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {successfullyUploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    onClick={() => handleOpenFile(file)}
                    className="flex items-center bg-[var(--surface)] p-2 rounded-md border border-[var(--border)] cursor-pointer hover:bg-[var(--blue-highlight)] transition-all duration-200"
                  >
                    <span className="text-xl mr-2">
                      {getFileIcon(file.name)}
                    </span>
                    <span
                      className="truncate text-sm text-[var(--text-primary)]"
                      title={file.name}
                    >
                      {file.name}
                    </span>
                  </div>
                ))}
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
              className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 backdrop-blur-sm overflow-y-auto"
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
            <h3 className="text-lg font-semibold mb-3">Selected Files</h3>
            <ul className="space-y-2">
              {files.map((file, idx) => (
                <li
                  key={idx}
                  className="flex justify-between items-center border p-2 rounded"
                >
                  <span>
                    {getFileIcon(file.name)} {file.name}
                  </span>
                  <button onClick={() => handleRemoveFile(idx)}>❌</button>
                </li>
              ))}
            </ul>
            <button
              onClick={handleUploadResume}
              disabled={isLoading}
              className="mt-5 w-full px-6 py-3 bg-[var(--accent)] text-white rounded hover:bg-[var(--accent-hover)]"
            >
              {isLoading
                ? `Uploading... ${uploadProgress}%`
                : "📤 Upload Resumes"}
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default UploadModal;
