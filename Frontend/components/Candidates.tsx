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

  // useEffect(() => {
  //   if (selectedJob) {
  //     fetch(`/api/getCandidates?jobId=${selectedJob}`)
  //       .then((res) => res.json())
  //       .then((data) => setCandidates(data))
  //       .catch((err) => console.error("Error fetching candidates:", err));
  //   }
  // }, [selectedJob]);
  // useEffect(() => { 
  //   setCandidates([{
  //     id: "1",
  //     name: "Alice Johnson",
  //     email: "alice.johnson@example.com",
  //     contact: "9876543210",
  //     resume: "https://example.com/resume/alice.pdf",
  //     compatibilityScore: 85,
  //     feedback: "Strong analytical skills, great communication.",
  //   },
  //   {
  //     id: "2",
  //     name: "Bob Smith",
  //     email: "bob.smith@example.com",
  //     contact: "9876543211",
  //     resume: "https://example.com/resume/bob.pdf",
  //     compatibilityScore: 78,
  //     feedback: "Good technical skills but needs improvement in teamwork.",
  //   },
  //   {
  //     id: "3",
  //     name: "Charlie Brown",
  //     email: "charlie.brown@example.com",
  //     contact: "9876543212",
  //     resume: "https://example.com/resume/charlie.pdf",
  //     compatibilityScore: 90,
  //     feedback: "Excellent coding skills and problem-solving abilities.",
  //   },
  //   {
  //     id: "4",
  //     name: "David Wilson",
  //     email: "david.wilson@example.com",
  //     contact: "9876543213",
  //     resume: "https://example.com/resume/david.pdf",
  //     compatibilityScore: 82,
  //     feedback: "Great leadership skills but needs more hands-on experience.",
  //   },
  //   {
  //     id: "5",
  //     name: "Evelyn Martinez",
  //     email: "evelyn.martinez@example.com",
  //     contact: "9876543214",
  //     resume: "https://example.com/resume/evelyn.pdf",
  //     compatibilityScore: 75,
  //     feedback: "Good at project management but needs to improve coding speed.",
  //   },
  //   {
  //     id: "6",
  //     name: "Franklin Thomas",
  //     email: "franklin.thomas@example.com",
  //     contact: "9876543215",
  //     resume: "https://example.com/resume/franklin.pdf",
  //     compatibilityScore: 88,
  //     feedback: "Very strong in algorithms and data structures.",
  //   },
  //   {
  //     id: "7",
  //     name: "Grace Lee",
  //     email: "grace.lee@example.com",
  //     contact: "9876543216",
  //     resume: "https://example.com/resume/grace.pdf",
  //     compatibilityScore: 80,
  //     feedback: "Quick learner, adapts well to new technologies.",
  //   },
  //   {
  //     id: "8",
  //     name: "Henry Scott",
  //     email: "henry.scott@example.com",
  //     contact: "9876543217",
  //     resume: "https://example.com/resume/henry.pdf",
  //     compatibilityScore: 77,
  //     feedback: "Good problem solver but needs better time management.",
  //   },
  //   {
  //     id: "9",
  //     name: "Isabella Lopez",
  //     email: "isabella.lopez@example.com",
  //     contact: "9876543218",
  //     resume: "https://example.com/resume/isabella.pdf",
  //     compatibilityScore: 92,
  //     feedback: "Exceptional communication and leadership skills.",
  //   },
  //   {
  //     id: "10",
  //     name: "James Anderson",
  //     email: "james.anderson@example.com",
  //     contact: "9876543219",
  //     resume: "https://example.com/resume/james.pdf",
  //     compatibilityScore: 79,
  //     feedback: "Good full-stack developer, needs improvement in backend optimization.",
  //   },
  // ])
  // }, []);

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
