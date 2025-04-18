// src/components/UploadForm.tsx
import React, {
  useState,
  useEffect,
  useRef,
  ChangeEvent,
  useMemo,
} from "react";
import styles from "../styles/Home.module.css";

type Job = {
  title: string;
  id: string;
};

const UploadForm = () => {
  const fileTypes = ["pdf", "docx", "jpg", "jpeg"]; // Added jpg/jpeg support
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
        },
      );
      if (response.ok) {
        const data = await response.json();
        // console.log(data);
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

  // Close dropdown when clicking outside
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
          ", ",
        )}. Please upload PDF, DOCX, or JPG,JPEG files.`,
      );
    } else {
      setErrorMessage("");
    }

    setFiles((prevFiles) => [...prevFiles, ...validFiles]); // Append new files to the existing list
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

  const getFileExtension = (filename: string): string => {
    return filename.split(".").pop()?.toLowerCase() || "";
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

  const handleUpload = async () => {
    if (!selectedJob) {
      setErrorMessage("Please select a job before uploading files.");
      return;
    }

    if (files.length === 0) {
      setErrorMessage("No files selected for upload.");
      return;
    }

    setIsLoading(true); // Start loading
    setUploadProgress(0);

    const formData = new FormData();
    files.forEach((file) => formData.append("resume-files", file));
    formData.append("job_id", jobId); // Add job title to form data

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

      // Small delay to show 100% progress before hiding the loader
      setTimeout(async () => {
        if (response.ok) {
          setFiles([]); // Reset the files after successful upload
          setErrorMessage("");
          setSuccessMessage("Files uploaded successfully.");
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

  // Function to get appropriate icon for file type
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
    <div className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg transition-all duration-300 hover:shadow-xl relative">
      <h1 className="text-2xl font-bold mb-6 text-center text-yellow-800">
        <span className="inline-block mr-2">📤</span>
        Upload Bulk Resumes
      </h1>

      {/* Custom Dropdown */}
      <div className="relative mb-6" ref={dropdownRef}>
        <div
          className={`w-full p-3 pl-10 border-2 rounded-lg text-gray-700 bg-yellow-50 border-yellow-300 hover:border-yellow-500 cursor-pointer transition-all duration-300 flex justify-between items-center ${
            selectedJob ? "font-medium" : "text-gray-500"
          }`}
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <div className="flex items-center">
            <span className="absolute left-3 text-gray-600">🔍</span>
            {selectedJob || "Select a Job Position"}
          </div>
          <span className="text-gray-600">{isDropdownOpen ? "▲" : "▼"}</span>
        </div>

        {isDropdownOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-yellow-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            <div
              className="p-3 hover:bg-yellow-100 cursor-pointer transition-colors duration-200 border-l-4 border-transparent hover:border-yellow-500"
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
                className="p-3 hover:bg-yellow-100 cursor-pointer transition-colors duration-200 border-l-4 border-transparent hover:border-yellow-500"
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
          Supported formats: PDF, DOCX, JPG ,JPEG
        </p>
      </div>

      {errorMessage && (
        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 animate-pulse">
          <div className="flex items-center">
            <span className="mr-2">⚠️</span>
            {errorMessage}
            
          </div>
        </div>
      )}
      {successMessage && (
        <div className="mt-4 p-4 bg-yellow-100 text-gray-400 rounded-lg border border-red-200">
          <div className="flex items-center">
            <span className="mr-2">✔️</span>
            {successMessage}
          </div>
        </div>
      )}

      {files.length > 0 && (
        <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
          <h2 className="text-lg font-semibold mb-3 flex items-center">
            <span className="mr-2">📋</span>
            Selected Files:
          </h2>
          <ul className="space-y-2">
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

      {/* Full-screen Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50">
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
