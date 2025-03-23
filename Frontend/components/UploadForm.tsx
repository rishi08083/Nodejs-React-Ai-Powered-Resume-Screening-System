// src/components/UploadForm.tsx
import { useState, useEffect, useRef, ChangeEvent } from "react";
import React from "react";
import styles from "../styles/Home.module.css";

type Job = {
  title: string;
};

const UploadForm = () => {
  const fileTypes = ["pdf", "docx"];
  const [file, setFile] = useState<File | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetch("/api/getjobs")
      .then((res) => res.json())
      .then((data) => setJobs(data))
      .catch((err) => console.error("Error fetching jobs:", err));
  }, []);

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    handleFile(droppedFile);
  };

  const handleFile = (file: File) => {
    if (file && fileTypes.includes(file.type.split("/")[1])) {
      setFile(file);
      setErrorMessage("");
    } else {
      setFile(null);
      setErrorMessage("Invalid file type. Please upload a PDF or DOCX.");
    }
  };

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      handleFile(selectedFile);
    }
  };

  return (
    <div>
      <select
        className="w-full p-2 border rounded mb-3"
        value={selectedJob}
        onChange={(e) => setSelectedJob(e.target.value)}
      >
        <option value="">Select a Job</option>
        {jobs.map((job, index) => (
          <option key={index} value={job.title} className="hover:bg-amber-500">
            {job.title}
          </option>
        ))}
      </select>
      <div
        className={styles.dragUpload}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <p>Drag & drop a file here, or click to select a file</p>
        <input
          type="file"
          multiple={true}
          accept=".pdf, .docx,.jpg"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className={styles.hiddenInput}
          id="file-input"
        />
        <label htmlFor="file-input" className={styles.fileInputLabel}>
          <button
            type="button"
            className={styles.fileInputButton}
            onClick={() => fileInputRef.current?.click()}
          >
            Click to Select a File
          </button>
        </label>
      </div>

      {errorMessage && (
        <div className={styles.errorMessage}>{errorMessage}</div>
      )}

      {file && (
        <div className={styles.fileDetails}>
          <p>File Name: {file.name}</p>
          <p>File Size: {(file.size / 1024).toFixed(2)} KB</p>
        </div>
      )}
    </div>
  );
};

export default UploadForm;
