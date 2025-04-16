const { useState } = require("react");

const { motion } = require("framer-motion");

type SearchFilterProps = {
  jobs: { id: string; title: string }[];
  setCandidates: (candidates: any[]) => void;
  originalCandidates: any[];
  selectedJob: string;
  setIsUploadModalOpen: (isOpen: boolean) => void;
  setSearchTerm: (term: string) => void;
  searchTerm: string;
  selectedRecommendation: string;
  setSelectedJob: (jobId: string) => void;
  setSelectedRecommendation: (recommendation: string) => void;
};

const SearchFilter = ({
  jobs,
  setCandidates,
  originalCandidates,
  selectedJob,
  setSearchTerm,
  searchTerm,
  selectedRecommendation,
  setSelectedJob,
  setSelectedRecommendation,
}: SearchFilterProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="flex flex-col md:flex-row items-center justify-between mb-8 space-y-4 md:space-y-0 md:space-x-4"
    >
      <div className="relative flex-[1.3] group h-12">
        <input
          type="text"
          placeholder="Search by Name or Email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-full p-3 pl-10 border rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--accent)] bg-[var(--surface)] border-[var(--border)] text-[var(--text-primary)] transition-all duration-300"
        />
        <svg
          className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[var(--text-secondary)] group-hover:text-[var(--accent)] transition-colors duration-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          ></path>
        </svg>
      </div>
      <div className="relative flex-[1.7] h-12">
        <select
          className="w-full h-full p-3 pl-4 border rounded-lg shadow-md appearance-none focus:outline-none focus:ring-2 focus:ring-[var(--accent)] bg-[var(--surface)] border-[var(--border)] text-[var(--text-primary)] transition-all duration-300"
          value={selectedJob}
          onChange={(e) => {
            setSelectedJob(e.target.value);
            setCandidates(originalCandidates); // Reset candidates when job changes
          }}
        >
          {jobs.map((job, index) => (
            <option key={job.id} value={job.id}>
              {job.title}
            </option>
          ))}
        </select>

        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[var(--text-secondary)] bg-[var(--accent)] rounded-r-lg">
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            ></path>
          </svg>
        </div>
      </div>

      {/* Recommendation Filter */}
      <div className="relative flex-[0.7] h-12">
        <select
          className={`w-full h-full p-2 pl-4 border rounded-lg shadow-md appearance-none focus:outline-none focus:ring-2 ${
            selectedJob
              ? "focus:ring-[var(--accent)] bg-[var(--surface)] border-[var(--border)] text-[var(--text-primary)]"
              : "bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed"
          } transition-all duration-300`}
          value={selectedRecommendation}
          onChange={(e) => {
            const value = e.target.value;
            setSelectedRecommendation(value);

            if (value === "") {
              setCandidates(originalCandidates);
            } else {
              const filtered = originalCandidates.filter(
                (candidate) =>
                  candidate.feedback?.feedback_text?.recommendation ===
                  value.toUpperCase()
              );
              setCandidates(filtered);
            }
          }}
          disabled={!selectedJob} // Disable when no job is selected
        >
          <option value="">Recommendation</option>
          <option value="YES">Yes</option>
          <option value="NO">No</option>
        </select>

        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[var(--text-secondary)] bg-[var(--accent)] rounded-r-lg">
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            ></path>
          </svg>
        </div>
      </div>
    </motion.div>
  );
};

export default SearchFilter;
