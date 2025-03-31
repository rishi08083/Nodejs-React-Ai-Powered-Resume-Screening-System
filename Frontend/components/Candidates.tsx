import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { fetchJobs, fetchCandidates, checkCandidateCompatibility } from "../api-services/CandidateServices";
import { log } from "console";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

type Job = {
  id: string;
  title: string;
};

type Candidate = {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  resume_url: string;
  compatibilityScore: number;
  feedback: string;
};



const UploadForm = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<string>("");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [compatibilityResponses, setCompatibilityResponses] = useState<{ [id: string]: string }>({});
  const candidatesPerPage = 10;

useEffect(() => {
  const getJobDetails = async () => {
    try {
      const response = await fetch(`${BASE_URL}/job/view`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
  
      if (response.ok) {
        const data = await response.json();
        setJobs(data.data);
        // setIsLoading(false);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
    } catch (error) {
      // setJobError(error instanceof Error ? error.message : 'Failed to fetch jobs');
      // setIsLoading(false);
    }
  };
  getJobDetails();
},[]);


useEffect(() => {
  // log(selectedJob, "selectedJob")
  const getCandidateDtails = async () => {
    try {
      const response = await fetch(`${BASE_URL}/candidates/list/${selectedJob}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
  
      if (response.ok) {
        const data = await response.json();
        setCandidates(data.data.candidates);
        // setIsLoading(false);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };
  getCandidateDtails();
},[selectedJob]);

  const filteredCandidates = useMemo(() => {
    return candidates.filter(
      (candidate) =>
        candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.id.toString().includes(searchTerm)
    );
  }, [candidates, searchTerm]);

  const indexOfLastCandidate = currentPage * candidatesPerPage;
  const indexOfFirstCandidate = indexOfLastCandidate - candidatesPerPage;
  const currentCandidates = filteredCandidates.slice(indexOfFirstCandidate, indexOfLastCandidate);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleCheckCompatibility = async (candidateId: string) => {
    try {
      const data = await checkCandidateCompatibility(candidateId);
      setCompatibilityResponses((prev) => ({
        ...prev,
        [candidateId]: data.message, // Assuming the API returns a "message" field
      }));
    } catch (error) {
      console.error("Error checking compatibility:", error);
      setCompatibilityResponses((prev) => ({
        ...prev,
        [candidateId]: "Error checking compatibility",
      }));
    }
  };

  return (
    <div className="w-full p-4 bg-gray-50">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Candidate List</h1>
        <p className="text-gray-600 mt-2">Search and manage candidates for your job postings.</p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 space-y-4 md:space-y-0">
        <input
          type="text"
          placeholder="Search by ID or Name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/2 p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
        <select
          className="w-full md:w-1/4 p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
          value={selectedJob}
          onChange={(e) => setSelectedJob(e.target.value)}
        >
          <option value="">Select a Job</option>
          {jobs.map((job) => (
            <option key={job.id} value={job.id}>
              {job.title}
            </option>
          ))}
        </select>
      </div>

      {/* Candidate Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg shadow-lg overflow-hidden"
      >
        <table className="min-w-full table-auto border-collapse">
          <thead>
            <tr className="bg-yellow-50 border-b border-yellow-100">
              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">Candidate Name</th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">Contact</th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">Resume</th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">Compatibility</th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">Feedback</th>
            </tr>
          </thead>
          <tbody>
            {currentCandidates.map((candidate, index) => (
              <motion.tr
                key={candidate.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="border-b border-gray-100 hover:bg-yellow-50 transition-colors duration-200"
              >
                <td className="px-4 py-4 text-sm font-medium text-gray-800">{candidate.name}</td>
                <td className="px-4 py-4 text-sm text-gray-600">{candidate.email}</td>
                <td className="px-4 py-4 text-sm text-gray-600">{candidate.phone_number}</td>
                <td className="px-4 py-4 text-sm">
                  <a
                    href={candidate.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-yellow-600 underline hover:text-yellow-800"
                  >
                    View Resume
                  </a>
                </td>
                <td className="px-4 py-4 text-sm text-gray-600">
                  {compatibilityResponses[candidate.id] ? (
                    <span>{compatibilityResponses[candidate.id]}</span>
                  ) : (
                    <button
                      onClick={() => handleCheckCompatibility(candidate.id)}
                      className="px-3 py-1 bg-yellow-400 text-white rounded-lg shadow hover:bg-yellow-500"
                    >
                      Check Compatibility
                    </button>
                  )}
                </td>
                <td className="px-4 py-4 text-sm text-gray-600">{candidate.feedback}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* Pagination */}
      <div className="flex justify-center space-x-2 mt-6">
        {[...Array(Math.ceil(filteredCandidates.length / candidatesPerPage)).keys()].map((number) => (
          <motion.button
            key={number + 1}
            onClick={() => paginate(number + 1)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-2 rounded-lg shadow-md ${
              currentPage === number + 1
                ? "bg-yellow-400 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {number + 1}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default React.memo(UploadForm);
