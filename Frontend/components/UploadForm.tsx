// src/components/UploadForm.tsx
import React, { useState, useEffect, useRef, ChangeEvent, useMemo } from "react";
import styles from "../styles/Home.module.css";

type Job = {
  title: string;
};

const UploadForm = () => {
  const fileTypes = ["pdf", "docx"];
  const [files, setFiles] = useState<File[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetch("/api/getjobs")
      .then((res) => res.json())
      .then((data) => setJobs(data))
      .catch((err) => console.error("Error fetching jobs:", err));
  }, []);

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFiles = event.dataTransfer.files;
    handleFile(droppedFiles);
  };

  const handleFile = (selectedFiles: FileList) => {
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    Array.from(selectedFiles).forEach((file) => {
      if (fileTypes.includes(file.type.split("/")[1])) {
        validFiles.push(file);
      } else {
        invalidFiles.push(file.name);
      }
    });

    if (invalidFiles.length > 0) {
      setErrorMessage(`Invalid file types: ${invalidFiles.join(", ")}. Please upload PDF or DOCX files.`);
    } else {
      setErrorMessage("");
    }

    setFiles((prevFiles) => [...prevFiles, ...validFiles]); // Append new files to the existing list
  };

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      handleFile(selectedFiles);
    }
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
    const formData = new FormData();
    files.forEach((file) => formData.append("resume-files", file));

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
      if (response.ok) {
        alert("Files uploaded successfully!");
        setFiles([]); // Reset the files after successful upload
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || "Failed to upload the files.");
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      setErrorMessage("An error occurred while uploading the files.");
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  const jobOptions = useMemo(
    () =>
      jobs.map((job, index) => (
        <option key={index} value={job.title}>
          {job.title}
        </option>
      )),
    [jobs]
  );

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4 text-center">Upload Your Resume</h1>
      <select
        className="w-full p-3 border rounded mb-4 text-gray-700"
        value={selectedJob}
        onChange={(e) => setSelectedJob(e.target.value)}
      >
        <option value="">Select a Job</option>
        {jobOptions}
      </select>

      <div
        className={`${styles.dragUpload} border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition`}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <p className="text-gray-500 mb-2">Drag & drop files here</p>
        <p className="text-gray-500">or</p>
        <input
          type="file"
          multiple={true}
          accept=".pdf, .docx,.jpg"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          id="file-input"
        />
        <label htmlFor="file-input">
          <button
            type="button"
            className="mt-3 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
            onClick={() => fileInputRef.current?.click()}
          >
            Select Files
          </button>
        </label>
      </div>

      {errorMessage && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
          {errorMessage}
        </div>
      )}

      {files.length > 0 && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Selected Files:</h2>
          <ul className="list-disc pl-5">
            {files.map((file, index) => (
              <li key={index} className="text-gray-700">
                {file.name} - {(file.size / 1024).toFixed(2)} KB
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
            onClick={handleUpload}
          >
            Upload Files
          </button>
        </div>
      )}

      {isLoading && (
        <div className="mt-4">
          <p className="text-blue-500">Uploading files, please wait...</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-blue-500 h-2.5 rounded-full animate-pulse" style={{ width: "100%" }}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(UploadForm);
