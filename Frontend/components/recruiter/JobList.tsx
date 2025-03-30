"use client";
import { useEffect, useState, useRef } from "react";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Upload, FileText } from "lucide-react";

interface Job {
  id: number;
  title: string;
  experience_required: string;
  openings: number;
  rcd_url?: string;
  is_rcd_uploaded: boolean;
}

const ListJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fileName, setFileName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [jobError, setJobError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleViewButtonClick = (job: Job) => {
    setSelectedJob(job);
    setShowModal(true);
  };

  const handleUploadRCD = async () => {
    if (!inputRef.current?.files?.length) {
      setUploadStatus("error");
      setError("Please select a file to upload");
      return;
    }

    const file = inputRef.current.files[0];
    const formData = new FormData();
    formData.append("rcd", file);
    formData.append("jobId", selectedJob?.id.toString() || "");

    try {
      setUploadStatus("uploading");
      setUploadProgress(0);
      const xhr = new XMLHttpRequest();
      xhr.open(
        "POST",
        `${process.env.NEXT_PUBLIC_API_URL}/api/rcd/upload-rcd`,
        true
      );
      xhr.setRequestHeader(
        "Authorization",
        `Bearer ${localStorage.getItem("token")}`
      );
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          setUploadProgress(percentComplete);
        }
      };
      xhr.onload = () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          setUploadStatus("success");
          setJobs((prevJobs) =>
            prevJobs.map((job) =>
              job.id === selectedJob?.id
                ? { ...job, rcd_url: data.data.documents[0] }
                : job
            )
          );
          setTimeout(() => {
            setShowModal(false);
            setUploadStatus("idle");
            setUploadProgress(0);
          }, 2000);
        } else {
          const errorData = JSON.parse(xhr.responseText);
          setUploadStatus("error");
          setError(errorData.message || "Upload failed");
        }
      };

      xhr.onerror = () => {
        setUploadStatus("error");
        setError("Network error. Please try again.");
      };

      xhr.send(formData);
    } catch (error) {
      setUploadStatus("error");
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    }
  };

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
        setJobs(data.data);
        setIsLoading(false);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
    } catch (error) {
      setJobError(
        error instanceof Error ? error.message : "Failed to fetch jobs"
      );
      setIsLoading(false);
    }
  };
  const handlercdRedirect = async (id) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/rcd/get-rcd/${id}`,
        {
          method: "GET",
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        // redirect to new web page
        window.open(data.data.documents);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // Fetch jobs from the API
  useEffect(() => {
    getJobDetails();
  }, []);

  return (
    <div className="w-full p-2">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Available Job Positions
        </h1>
        <p className="text-gray-600 mt-2">
          Browse our current openings and upload RCD
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-12 h-12 rounded-full border-4 border-yellow-400 border-t-transparent animate-spin"></div>
        </div>
      ) : jobError ? (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{jobError}</span>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-xl overflow-scroll "
        >
          <div className="overflow-scroll">
            <table className="min-w-full table-auto border-collapse">
              <thead>
                <tr className="bg-yellow-50 border-b border-yellow-100">
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">
                    Title
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">
                    Experience
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">
                    Openings
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job, index) => (
                  <motion.tr
                    key={job.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-b border-gray-100 hover:bg-yellow-50 transition-colors duration-200"
                  >
                    <td className="px-4 py-4 text-sm font-medium text-gray-800">
                      {job.title}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {job.experience_required}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                        {job.openings} positions
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm flex space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-3 py-2 bg-yellow-400 text-black font-medium rounded-lg hover:bg-yellow-500 transition-colors duration-200 shadow-md hover:shadow-lg flex items-center space-x-1"
                        onClick={() => handleViewButtonClick(job)}
                      >
                        <Upload className="h-4 w-4" />
                        {job.is_rcd_uploaded ? (
                          <span>Update RCD</span>
                        ) : (
                          <span>Upload RCD</span>
                        )}
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          handlercdRedirect(job.id);
                        }}
                        className="px-3 py-2 bg-gray-200 text-black font-medium rounded-lg hover:bg-gray-500 transition-colors duration-200 shadow-md hover:shadow-lg flex items-center space-x-1"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View</span>
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && selectedJob && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center  bg-opacity-50 p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="bg-yellow-400 p-6">
                <h2 className="text-xl font-bold text-black">
                  Upload RCD for {selectedJob.title}
                </h2>
                <p className="text-yellow-800 mt-1 text-sm">
                  Experience required: {selectedJob.experience_required}
                </p>
              </div>

              <div className="p-6">
                {uploadStatus === "error" && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                  </div>
                )}

                {uploadStatus === "success" && (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    Document uploaded successfully!
                  </div>
                )}

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload RCD documents
                  </label>
                  <div
                    className={`border-2 ${
                      uploadStatus === "error"
                        ? "border-red-300"
                        : "border-dashed border-yellow-300"
                    } rounded-lg p-6 text-center hover:border-yellow-400 transition-colors duration-200`}
                  >
                    <FileText className="mx-auto h-12 w-12 text-yellow-400" />
                    <p className="mt-2 text-sm text-gray-600">
                      Drag and drop your file here, or
                      <span
                        className="text-yellow-600 font-medium cursor-pointer"
                        onClick={() => {
                          inputRef.current?.click();
                        }}
                      >
                        {" "}
                        browse <br />
                        {fileName && fileName}
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      PDF, DOC or DOCX up to 10MB
                    </p>
                    <input
                      type="file"
                      className="hidden"
                      ref={inputRef}
                      onChange={() => {
                        setFileName(inputRef.current?.files[0].name);
                      }}
                      accept=".pdf,.doc,.docx"
                    />
                  </div>
                </div>

                {uploadStatus === "uploading" && (
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                    <div
                      className="bg-yellow-400 h-2.5 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors duration-200"
                    onClick={() => {
                      setShowModal(false);
                      setUploadStatus("idle");
                      setUploadProgress(0);
                    }}
                    disabled={uploadStatus === "uploading"}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 py-2 text-black font-medium rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg ${
                      uploadStatus === "uploading"
                        ? "bg-yellow-300 cursor-not-allowed"
                        : "bg-yellow-400 hover:bg-yellow-500"
                    }`}
                    onClick={handleUploadRCD}
                    disabled={uploadStatus === "uploading"}
                  >
                    {uploadStatus === "uploading" ? "Uploading..." : "Upload"}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ListJobs;
