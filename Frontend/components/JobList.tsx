"use client";
import { useEffect, useState } from "react";
import React from "react";
interface Job {
  title: string;
  experience: string;
  openings: number;
}

const ListJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]); 
  const [showModal, setShowModal] = useState<boolean>(false); 
  const [selectedJob, setSelectedJob] = useState<Job | null>(null); 

  const handleViewButtonClick = (job: Job) => {
    setSelectedJob(job); 
    setShowModal(true); // Show the modal
  };

  // Fetch jobs from the API
  useEffect(() => {
    fetch("/api/getjobs")
      .then((data) => data.json())
      .then((response: Job[]) => { // Ensuring response is typed as an array of Job
        setJobs(response);
      })
      .catch((err) => {
        alert(err);
      });
  }, []);

  return (
    <div className="w-full p-5">
      <table className="min-w-full table-auto border-collapse bg-white shadow-lg rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Title</th>
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Experience</th>
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Openings</th>
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Action</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job, index) => (
            <tr key={index} className="even:bg-gray-50 hover:bg-gray-100">
              <td className="px-4 py-3 text-sm">{job.title}</td>
              <td className="px-4 py-3 text-sm">{job.experience}</td>
              <td className="px-4 py-3 text-sm">{job.openings}</td>
              <td className="px-4 py-3 text-sm">
                <button
                  className="px-4 py-2 bg-yellow-400 text-black rounded-md hover:bg-yellow-500"
                  onClick={() => handleViewButtonClick(job)}
                >
                  Upload RCD
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      {showModal && selectedJob && (
        <div className="fixed inset-0 flex items-center justify-center  bg-opacity-50 p-10">
          <div className="bg-white p-9 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4">
              Upload RCD for {selectedJob.title}
            </h2>
            <input type="file" className="mb-4 w-full border border-gray-300 rounded-md p-2" />
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-400 text-white rounded-md"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-yellow-400 text-white rounded-md">
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListJobs;
