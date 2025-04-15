import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

type Candidate = {
  candidateId: string;
  name: string;
  email: string;
  phone: string;
  skills: string[];
  experience?: {
    company: string;
    job_title: string;
    start_date: string;
    end_date: string;
  }[];
  education?: {
    College: string;
    Degree: string;
    start_date: string;
    end_date: string;
  }[];
  locations?: string[];
};

const SkillBadge: React.FC<{ skill: string }> = ({ skill }) => (
  <span className="inline-block bg-[var(--surface)] text-[var(--accent)] rounded-full px-3 py-1 text-sm font-medium mr-2 mb-2 border border-[var(--border)]">
    {skill}
  </span>
);

const AccordionItem: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}> = ({ title, icon, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mb-6 overflow-hidden rounded-xl border border-[var(--border)] shadow-sm">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-[var(--surface)] text-left hover:bg-[var(--surface-lighter)] transition-all duration-300"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        aria-expanded={isOpen}
      >
        <div className="flex items-center">
          <div className="mr-3 text-[var(--accent)]">{icon}</div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">
            {title}
          </h3>
        </div>
        <div
          className="text-[var(--accent)] transition-transform duration-300"
          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
          aria-hidden="true"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </motion.button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="p-4 bg-[var(--surface)]">{children}</div>
      </motion.div>
    </div>
  );
};

const ParseCandidate: React.FC<{
  candidateId: Candidate["candidateId"];
}> = ({ candidateId }) => {
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const getParseResume = async (candidateId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/parsed-resume/${candidateId}`,
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
        setCandidate(data.data);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch resume data");
      }
    } catch (error) {
      console.error(error);
      setError(error instanceof Error ? error.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (candidateId) {
      getParseResume(candidateId);
    }
  }, [candidateId]);

  if (loading) {
    return (
      <div className="bg-[var(--bg)] min-h-[200px] p-6 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[var(--bg)] min-h-[200px] p-6 flex items-center justify-center">
        <div className="text-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="40" 
            height="40" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="mx-auto mb-4 text-red-400"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <p className="text-[var(--text-secondary)]">{error}</p>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="bg-[var(--bg)] min-h-[200px] p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-[var(--text-secondary)]">No candidate data found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg)] min-h-screen p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header Section */}
        <div className="mb-8 bg-[var(--surface)] rounded-xl shadow-lg overflow-hidden border border-[var(--border)]">
          <div className="md:flex">
            <div className="md:flex-shrink-0 bg-[var(--accent)] p-6 flex items-center justify-center">
              <div className="h-24 w-24 rounded-full bg-white/20 flex items-center justify-center text-white text-3xl font-bold">
                {candidate.name && candidate.name.charAt(0)}
              </div>
            </div>
            <div className="p-6">
              <div className="uppercase tracking-wide text-sm text-[var(--accent)] font-semibold">
                Candidate Profile
              </div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)] mt-1">
                {candidate.name}
              </h1>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <div className="rounded-full bg-[var(--surface-lighter)] p-2 mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-[var(--accent)]"
                    >
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Phone
                    </p>
                    {candidate.phone ? (
                      <a
                        href={`tel:${candidate.phone}`}
                        className="font-medium text-[var(--text-primary)] underline hover:text-[var(--accent)] transition-colors"
                      >
                        {candidate.phone}
                      </a>
                    ) : (
                      <p className="font-medium text-[var(--text-secondary)]">
                        Not provided
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="rounded-full bg-[var(--surface-lighter)] p-2 mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-[var(--accent)]"
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Email
                    </p>
                    {candidate.email ? (
                      <a
                        href={`mailto:${candidate.email}`}
                        className="font-medium text-[var(--text-primary)] underline hover:text-[var(--accent)] transition-colors"
                      >
                        {candidate.email}
                      </a>
                    ) : (
                      <p className="font-medium text-[var(--text-secondary)]">
                        Not provided
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Skills Section */}
        <AccordionItem
          title="Skills"
          defaultOpen={true}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"></path>
            </svg>
          }
        >
          <div className="flex flex-wrap">
            {candidate.skills && candidate.skills.length > 0 ? (
              candidate.skills.map((skill, index) => (
                <SkillBadge key={index} skill={skill} />
              ))
            ) : (
              <p className="text-[var(--text-secondary)]">No skills listed</p>
            )}
          </div>
          {candidate.skills && candidate.skills.length > 20 && (
            <p className="text-[var(--text-secondary)] mt-4 text-sm">
              <em>
                This candidate has {candidate.skills.length} skills in total
              </em>
            </p>
          )}
        </AccordionItem>

        {/* Experience Section */}
        {candidate.experience && candidate.experience.length > 0 && (
          <AccordionItem
            title="Work Experience"
            defaultOpen={true}
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
            }
          >
            <div className="space-y-4">
              {candidate.experience.map((exp, index) => (
                <div
                  key={index}
                  className="border-l-4 border-[var(--accent)] pl-4 py-1"
                >
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <h4 className="font-medium text-[var(--text-primary)]">
                      {exp.job_title}
                    </h4>
                    <span className="bg-[var(--surface-lighter)] text-[var(--text-secondary)] text-xs px-2 py-1 rounded">
                      {exp.start_date} - {exp.end_date || "Present"}
                    </span>
                  </div>
                  <p className="text-[var(--text-secondary)]">{exp.company}</p>
                </div>
              ))}
            </div>
          </AccordionItem>
        )}

        {/* Education Section */}
        {candidate.education && candidate.education.length > 0 && (
          <AccordionItem
            title="Education"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
              </svg>
            }
          >
            <div className="space-y-4">
              {candidate.education.map((edu, index) => (
                <div
                  key={index}
                  className="border-l-4 border-[var(--accent)] pl-4 py-1"
                >
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <h4 className="font-medium text-[var(--text-primary)]">
                      {edu.Degree}
                    </h4>
                    <span className="bg-[var(--surface-lighter)] text-[var(--text-secondary)] text-xs px-2 py-1 rounded">
                      {edu.start_date} - {edu.end_date || "Present"}
                    </span>
                  </div>
                  <p className="text-[var(--text-secondary)]">{edu.College}</p>
                </div>
              ))}
            </div>
          </AccordionItem>
        )}

        {/* Locations Section */}
        {candidate.locations && candidate.locations.length > 0 && (
          <AccordionItem
            title="Preferred Locations"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            }
          >
            <div className="flex flex-wrap">
              {candidate.locations.map((location, index) => (
                <span
                  key={index}
                  className="inline-block bg-[var(--surface-lighter)] text-[var(--text-primary)] rounded-full px-3 py-1 text-sm font-medium mr-2 mb-2"
                >
                  {location}
                </span>
              ))}
            </div>
          </AccordionItem>
        )}

        {/* Actions Footer */}
        <div className="mt-8 flex justify-end">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-black px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 font-medium flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
            </svg>
            Add to Shortlist
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default ParseCandidate;