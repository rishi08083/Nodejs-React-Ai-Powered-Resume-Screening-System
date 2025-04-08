// upload/page.tsx
"use client";
import React, {
  useState,
  useEffect,
  useRef,
  ChangeEvent,
  useMemo,
} from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type Job = {
  title: string;
  id: string;
};

const UploadForm = () => {
  const fileTypes = ["pdf", "docx", "jpg", "jpeg"];
  const [files, setFiles] = useState<File[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [jobId, setJobId] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    getJobDetails();
  }, []);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
      const errorMsg = `Invalid file types: ${invalidFiles.join(
        ", "
      )}. Please upload PDF, DOCX, or JPG ,JPEG files.`;
      setErrorMessage(errorMsg);
      toast.error(errorMsg, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
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
    // Reset the input value so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    // Reset the file input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    setSuccessMessage(null);
    setErrorMessage("");
    if (!selectedJob) {
      const errorMsg = "Please select a job before uploading files.";
      setErrorMessage(errorMsg);
      toast.error(errorMsg, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }

    if (files.length === 0) {
      const errorMsg = "No files selected for upload.";
      setErrorMessage(errorMsg);
      toast.error(errorMsg, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }

    setIsLoading(true);
    setUploadProgress(0);

    const formData = new FormData();
    files.forEach((file) => formData.append("resume-files", file));
    formData.append("job_id", jobId);

    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/upload/upload-resume`;
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

      setTimeout(async () => {
        if (response.ok) {
          setFiles([]);
          setErrorMessage("");
          const successMsg = "Files uploaded successfully.";
          setSuccessMessage(successMsg);
          toast.success(successMsg, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
          // Reset file input after successful upload
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        } else {
          const errorData = await response.json();
          const errorMsg = errorData.errors.map(
            (error: { file: string; error: string }) => {
              return `${error.file} ${error.error}`;
            }
          );
          const fullErrorMsg =
            `${errorData.message}   
             ${errorMsg.join("\n")}` || "Failed to upload the files.";
          setErrorMessage(fullErrorMsg);
          toast.error(fullErrorMsg, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        }
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error("Error uploading files:", error);
      const errorMsg = "An error occurred while uploading the files.";
      setErrorMessage(errorMsg);
      toast.error(errorMsg, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
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

  return (
    <div className="max-w-2/3 mt-17 mx-auto p-6 bg-[var(--surface)] shadow-lg rounded-lg transition-all duration-300 hover:shadow-xl relative border border-[var(--border)]">
      <ToastContainer />
      <h1 className="text-2xl font-bold mb-6 text-center text-[var(--accent)]">
        <span className="inline-block mr-2">📤</span>
        Upload Bulk Resumes
      </h1>

      {/* Custom Dropdown */}
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
              🔍
            </span>
            {selectedJob || "Select a Job Position"}
          </div>
          <span className="text-[var(--text-secondary)]">
            {isDropdownOpen ? "▲" : "▼"}
          </span>
        </div>

        {isDropdownOpen && (
          <div className="absolute z-10 w-full mt-1 bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-lg max-h-60 overflow-y-auto">
            <div
              className="p-3 hover:bg-[var(--surface-lighter)] cursor-pointer transition-colors duration-200 border-l-4 border-transparent hover:border-[var(--accent)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              onClick={() => {
                setSelectedJob("");
                setIsDropdownOpen(false);
              }}
            >
              Select a Job Position
            </div>
            {jobs.map((job, index) => (
              <div
                key={index}
                className="p-3 hover:bg-[var(--surface-lighter)] cursor-pointer transition-colors duration-200 border-l-4 border-transparent hover:border-[var(--accent)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                onClick={() => {
                  setSelectedJob(job.title);
                  setJobId(job.id);
                  setIsDropdownOpen(false);
                }}
              >
                {job.title}
              </div>
            ))}
          </div>
        )}
      </div>

      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
          isDragging
            ? "border-[var(--accent)] bg-[var(--surface-lighter)] scale-105"
            : "border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--surface-lighter)]"
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
      >
        <div className="flex flex-col items-center justify-center">
          <span className="text-4xl mb-3">📁</span>
          <p className="text-[var(--text-secondary)] mb-2">
            Drag & drop files here
          </p>
          <p className="text-[var(--text-secondary)] opacity-70 mb-3">or</p>
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
              className="px-6 py-3 bg-[var(--accent)] text-[var(--dark-bg)] rounded-lg hover:bg-[var(--accent-hover)] transform hover:-translate-y-1 transition-all duration-300 flex items-center"
              onClick={() => fileInputRef.current?.click()}
            >
              <span className="mr-2">📂</span>
              Select Files
            </button>
          </label>
        </div>
        <p className="mt-4 text-xs text-[var(--text-secondary)] opacity-70">
          Supported formats: PDF, DOCX, and IMAGES
        </p>
      </div>

      {files.length > 0 && (
        <div className="mt-6 bg-[var(--surface-lighter)] p-4 rounded-lg border border-[var(--border)]">
          <h2 className="text-lg font-semibold mb-3 flex items-center text-[var(--text-primary)]">
            <span className="mr-2">📋</span>
            Selected Files:
          </h2>
          <ul className="space-y-2">
            {files.map((file, index) => (
              <li
                key={index}
                className="flex items-center justify-between p-3 bg-[var(--surface)] rounded border border-[var(--border)] hover:border-[var(--accent)] transition-all duration-200"
              >
                <div className="flex items-center">
                  <span className="text-xl mr-3">{getFileIcon(file.name)}</span>
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
            onClick={handleUpload}
            disabled={isLoading}
          >
            <span className="mr-2">📤</span>
            Upload Files
          </button>
        </div>
      )}

      {/* Full-screen Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0  bg-opacity-90 flex items-center justify-center z-50">
          <div className="bg-[var(--surface)] p-8 rounded-xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-105 border border-[var(--border)]">
            <div className="flex flex-col items-center">
              <div className="text-6xl mb-6 animate-bounce">⏳</div>
              <h3 className="text-2xl font-bold text-[var(--accent)] mb-4">
                Uploading Files
              </h3>
              <p className="text-[var(--text-secondary)] mb-6 text-center">
                Please wait while we process your files...
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
  );
};

export default React.memo(UploadForm);
