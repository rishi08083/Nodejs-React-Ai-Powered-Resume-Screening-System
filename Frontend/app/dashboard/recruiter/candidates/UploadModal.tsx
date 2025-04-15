import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

type UploadModalProps = {
  closeModal: () => void;
  setIsUploadModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
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
      className="fixed inset-0 bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm"
      onClick={closeModal}
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
