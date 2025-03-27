import React, { useState, useEffect, useMemo } from "react";
import styles from "../styles/Home.module.css";

type Job = {
  id: string;
  title: string;
};

type Candidate = {
  id: string;
  name: string;
  email: string;
  contact: string;
  resume: string;
  compatibilityScore: number;
  feedback: string;
};

const UploadForm = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<string>("");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const candidatesPerPage = 5;

  useEffect(() => {
    fetch("/api/getjobs")
      .then((res) => res.json())
      .then((data) => setJobs(data))
      .catch((err) => console.error("Error fetching jobs:", err));
  }, []);

  useEffect(() => {
    if (selectedJob) {
      fetch(`/api/getCandidates?jobId=${selectedJob}`)
        .then((res) => res.json())
        .then((data) => setCandidates(data))
        .catch((err) => console.error("Error fetching candidates:", err));
    }
  }, [selectedJob]);

  const jobOptions = useMemo(
    () =>
      jobs.map((job) => (
        <option key={job.id} value={job.id}>
          {job.title}
        </option>
      )),
    [jobs]
  );

  const indexOfLastCandidate = currentPage * candidatesPerPage;
  const indexOfFirstCandidate = indexOfLastCandidate - candidatesPerPage;
  const currentCandidates = candidates.slice(indexOfFirstCandidate, indexOfLastCandidate);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4 text-center">Candidate List</h1>
      <select
        className="w-full p-3 border rounded mb-4 text-gray-700"
        value={selectedJob}
        onChange={(e) => setSelectedJob(e.target.value)}
      >
        <option value="">Select a Job</option>
        {jobOptions}
      </select>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">Candidate Name</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Contact</th>
              <th className="p-2 border">Resume</th>
              <th className="p-2 border">Compatibility Score</th>
              <th className="p-2 border">Feedback</th>
            </tr>
          </thead>
          <tbody>
            {currentCandidates.map((candidate) => (
              <tr key={candidate.id} className="border">
                <td className="p-2 border">{candidate.name}</td>
                <td className="p-2 border">{candidate.email}</td>
                <td className="p-2 border">{candidate.contact}</td>
                <td className="p-2 border">
                  <a href={candidate.resume} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                    View Resume
                  </a>
                </td>
                <td className="p-2 border">{candidate.compatibilityScore}%</td>
                <td className="p-2 border">{candidate.feedback}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center space-x-2 mt-4">
        {[...Array(Math.ceil(candidates.length / candidatesPerPage)).keys()].map((number) => (
          <button key={number + 1} onClick={() => paginate(number + 1)} className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400">
            {number + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default React.memo(UploadForm);
