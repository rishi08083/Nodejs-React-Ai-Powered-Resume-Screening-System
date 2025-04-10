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
  setIsUploadModalOpen,
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
      <div className="relative w-full md:w-1/3 group h-12">
        <input
          type="text"
          placeholder="Search by ID or Name"
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
      <div className="relative w-full md:w-1/3 h-12">
        <select
          className="w-full h-full p-3 pl-4 border rounded-lg shadow-md appearance-none focus:outline-none focus:ring-2 focus:ring-[var(--accent)] bg-[var(--surface)] border-[var(--border)] text-[var(--text-primary)] transition-all duration-300"
          value={selectedJob}
          onChange={(e) => {
            setSelectedJob(e.target.value);
            setCandidates(originalCandidates); // Reset candidates when job changes
          }}
        >
          <option value="" disabled>
            Select a Job
          </option>
          {jobs.map((job, index) => (
            <option key={job.id} value={job.id}>
              {job.title}
            </option>
          ))}
        </select>
        {jobs.length > 0 &&
          selectedJob === "" &&
          (() => {
            setSelectedJob(jobs[0].id);
            return null;
          })()}
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
      <div className="relative w-full md:w-1/6 h-12">
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
                  candidate.feedback.feedback_text.recommendation ===
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

      {/* Upload Resume Button */}
      <button
        type="button"
        className="h-12 px-4 py-2 bg-[var(--accent)] text-[var(--dark-bg)] rounded-lg flex items-center hover:bg-[var(--accent-hover)] transition-all duration-300 disabled:bg-[var(--border)] disabled:cursor-not-allowed disabled:text-[var(--text-secondary)]"
        onClick={() => setIsUploadModalOpen(true)}
        disabled={!selectedJob}
      >
        <svg
          className="h-6 w-6 mr-2"
          fill="#000000"
          version="1.1"
          id="Capa_1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 490.955 490.955"
          xmlSpace="preserve"
        >
          <path
            id="XMLID_448_"
            d="M445.767,308.42l-53.374-76.49v-20.656v-11.366V97.241c0-6.669-2.604-12.94-7.318-17.645L312.787,7.301
              C308.073,2.588,301.796,0,295.149,0H77.597C54.161,0,35.103,19.066,35.103,42.494V425.68c0,23.427,19.059,42.494,42.494,42.494
              h159.307h39.714c1.902,2.54,3.915,5,6.232,7.205c10.033,9.593,23.547,15.576,38.501,15.576c26.935,0-1.247,0,34.363,0
              c14.936,0,28.483-5.982,38.517-15.576c11.693-11.159,17.348-25.825,17.348-40.29v-40.06c16.216-3.418,30.114-13.866,37.91-28.811
              C459.151,347.704,457.731,325.554,445.767,308.42z M170.095,414.872H87.422V53.302h175.681v46.752
              c0,16.655,13.547,30.209,30.209,30.209h46.76v66.377h-0.255v0.039c-17.685-0.415-35.529,7.285-46.934,23.46l-61.586,88.28
              c-11.965,17.134-13.387,39.284-3.722,57.799c7.795,14.945,21.692,25.393,37.91,28.811v19.842h-10.29H170.095z M410.316,345.771
              c-2.03,3.866-5.99,6.271-10.337,6.271h-0.016h-32.575v83.048c0,6.437-5.239,11.662-11.659,11.662h-0.017H321.35h-0.017
              c-6.423,0-11.662-5.225-11.662-11.662v-83.048h-32.574h-0.016c-4.346,0-8.308-2.405-10.336-6.271
              c-2.012-3.866-1.725-8.49,0.783-12.07l61.424-88.064c2.189-3.123,5.769-4.984,9.57-4.984h0.017c3.802,0,7.38,1.861,9.568,4.984
              l61.427,88.064C412.04,337.28,412.328,341.905,410.316,345.771z"
          />
        </svg>
        Upload Resume
      </button>
    </motion.div>
  );
};

export default SearchFilter;
