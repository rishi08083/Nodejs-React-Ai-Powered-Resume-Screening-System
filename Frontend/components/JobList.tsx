"use client";
import { useEffect, useState, useRef } from "react";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Job {
  title: string;
  experience: string;
  openings: number;
}

const ListJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleViewButtonClick = (job: Job) => {
    setSelectedJob(job);
    setShowModal(true);
  };

  // Fetch jobs from the API
  useEffect(() => {
    setIsLoading(true);
    fetch("/api/getjobs")
      .then((data) => data.json())
      .then((response: Job[]) => {
        setJobs(response);
        console.log(response);
        setIsLoading(false);
      })
      .catch((err) => {
        alert("Failed to load jobs: " + err);
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="w-full p-2  overflow-scroll">
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
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-xl overflow-scroll"
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
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-b border-gray-100 hover:bg-yellow-50 transition-colors duration-200"
                  >
                    <td className="px-4 py-4 text-sm font-medium text-gray-800">
                      {job.title}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {job.experience}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                        {job.openings} positions
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 bg-yellow-400 text-black font-medium rounded-lg hover:bg-yellow-500 transition-colors duration-200 shadow-md hover:shadow-lg flex items-center space-x-1"
                        onClick={() => handleViewButtonClick(job)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                          />
                        </svg>
                        <span>Upload RCD</span>
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
                  Experience required: {selectedJob.experience}
                </p>
              </div>

              <div className="p-6">
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                   Upload RCD documents
                  </label>
                  <div className="border-2 border-dashed border-yellow-300 rounded-lg p-6 text-center hover:border-yellow-400 transition-colors duration-200">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mx-auto h-12 w-12 text-yellow-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <p className="mt-2 text-sm text-gray-600">
                      Drag and drop your file here, or
                      <span
                        className="text-yellow-600 font-medium cursor-pointer"
                        onClick={() => {
                          //click input file manually from ref
                          inputRef.current.click();
                        }}
                      >
                        {" "}
                        browse
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      PDF, DOC or DOCX up to 10MB
                    </p>
                    <input type="file" className="hidden" ref={inputRef} />
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors duration-200"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-yellow-400 text-black font-medium rounded-lg hover:bg-yellow-500 transition-colors duration-200 shadow-md hover:shadow-lg"
                  >
                    Upload
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
