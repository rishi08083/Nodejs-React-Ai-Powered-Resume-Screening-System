import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  MapPin,
  Clock,
  Briefcase,
  Users,
  Building,
  Mail,
  DollarSign,
  Calendar,
  CheckCircle2,
  Star,
  ChevronRight,
  Share2,
  Bookmark,
  Printer,
  ExternalLink,
  IndianRupee,
  Phone
} from "lucide-react";

export interface JobDetails {
  id: number;
  title: string;
  description: string;
  location: string;
  experience_required: string;
  job_type: string;
  openings: number;
  company_name: string;
  skills_required: string[];
  must_have_skills?: string[];
  nice_to_have_skills?: string[];
  contact_info: string;
  salary_range?: string;
  application_deadline?: string;
  created_at?: string;
  responsibilities?: string;
  qualifications?: string;
  benefits?: string;
}

type JobModalProps = {
  job: JobDetails | null;
  onClose: () => void;
  isLoading?: boolean;
  error?: string | null;
};

const JobModal: React.FC<JobModalProps> = ({
  job,
  onClose,
  isLoading = false,
  error = null,
}) => {
  const [activeTab, setActiveTab] = useState<'description' | 'responsibilities' | 'qualifications'>('description');

  // Loading state
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 400 }}
          className="bg-[var(--surface)] w-full max-w-md p-8 rounded-2xl shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full border-4 border-[var(--accent)] border-t-transparent animate-spin mb-6"></div>
            <p className="text-[var(--text-primary)] text-lg font-medium">
              Loading job details...
            </p>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  // Error state
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 400 }}
          className="bg-[var(--surface)] w-full max-w-md p-8 rounded-2xl shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-center">
            <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-red-100 mb-5">
              <X size={30} className="text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-3">
              Error Loading Job Details
            </h3>
            <p className="text-[var(--text-secondary)] mb-6 max-w-md mx-auto">
              {error}
            </p>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-[var(--accent)] text-white rounded-lg font-medium hover:bg-opacity-90 transition-all shadow-md"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  if (!job) return null;

  // Parse description as HTML and convert bullet points
  const formatContent = (content: string = "No information available") => {
    // Split by newlines
    const paragraphs = content.split("\n").filter((p) => p.trim() !== "");

    if (paragraphs.length === 0) {
      return (
        <p className="text-[var(--text-secondary)]">No information available</p>
      );
    }

    return (
      <ul className="space-y-3 list-inside">
        {paragraphs.map((paragraph, index) => {
          // Check if paragraph starts with a bullet point indicator
          if (
            paragraph.trim().startsWith("•") ||
            paragraph.trim().startsWith("-") ||
            paragraph.trim().startsWith("*")
          ) {
            return (
              <li 
                key={index} 
                className="flex items-start text-[var(--text-primary)] text-sm md:text-base leading-relaxed"
              >
                <ChevronRight className="h-4 w-4 text-[var(--accent)] mt-1 mr-2 shrink-0" />
                <span>{paragraph.trim().substring(1).trim()}</span>
              </li>
            );
          }

          return (
            <p key={index} className="mb-4 text-[var(--text-primary)] text-sm md:text-base leading-relaxed">
              {paragraph}
            </p>
          );
        })}
      </ul>
    );
  };

  // Process skills
  let mustHaveSkills: string[] = [];
  let niceToHaveSkills: string[] = [];

  // If skills are already separated
  if (job.must_have_skills || job.nice_to_have_skills) {
    mustHaveSkills = job.must_have_skills || [];
    niceToHaveSkills = job.nice_to_have_skills || [];
  } 
  // Otherwise, assume all skills are required/must have
  else {
    const allSkills = typeof job.skills_required === "string"
      ? (job.skills_required as string).split(",").map((skill) => skill.trim())
      : job.skills_required || [];
    
    mustHaveSkills = allSkills;
  }

  // Date formatter
  const formatDate = (dateString: string) => {
    if (!dateString) return "Not specified";

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-2 md:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ 
          type: "spring", 
          damping: 30, 
          stiffness: 400,
          duration: 0.3
        }}
        className="bg-[var(--surface)] w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-secondary,var(--accent))] p-6 md:p-8 relative">
          <button
            onClick={onClose}
            className="absolute right-6 top-6 text-white hover:bg-white/20 p-2 rounded-full transition-all duration-200"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>

          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 pr-10">
            {job.title}
          </h1>

          <div className="flex flex-wrap gap-4 mt-4">
            {job.company_name && (
              <div className="flex items-center text-white/90 text-sm">
                <Building size={18} className="mr-2" />
                {job.company_name}
              </div>
            )}

            {job.location && (
              <div className="flex items-center text-white/90 text-sm">
                <MapPin size={18} className="mr-2" />
                {job.location}
              </div>
            )}

            {job.experience_required && (
              <div className="flex items-center text-white/90 text-sm">
                <Briefcase size={18} className="mr-2" />
                {job.experience_required}
              </div>
            )}

            {job.job_type && (
              <div className="flex items-center text-white/90 text-sm">
                <Clock size={18} className="mr-2" />
                {job.job_type}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          {/* Key Details Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-[var(--bg)] p-4 rounded-xl border border-[var(--border)] shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-[var(--text-secondary)] text-xs font-medium uppercase tracking-wider mb-2">
                Openings
              </h3>
              <div className="flex items-center">
                <Users size={18} className="text-[var(--accent)] mr-2" />
                <span className="text-[var(--text-primary)] font-semibold">
                  {job.openings}
                </span>
              </div>
            </div>

            {job.salary_range && (
              <div className="bg-[var(--bg)] p-4 rounded-xl border border-[var(--border)] shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-[var(--text-secondary)] text-xs font-medium uppercase tracking-wider mb-2">
                  Salary Range
                </h3>
                <div className="flex items-center">
                  <IndianRupee size={18} className="text-[var(--accent)] mr-2" />
                  <span className="text-[var(--text-primary)] font-semibold">
                    {job.salary_range}
                  </span>
                </div>
              </div>
            )}

            {job.application_deadline && (
              <div className="bg-[var(--bg)] p-4 rounded-xl border border-[var(--border)] shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-[var(--text-secondary)] text-xs font-medium uppercase tracking-wider mb-2">
                  Apply By
                </h3>
                <div className="flex items-center">
                  <Calendar size={18} className="text-[var(--accent)] mr-2" />
                  <span className="text-[var(--text-primary)] font-semibold">
                    {formatDate(job.application_deadline)}
                  </span>
                </div>
              </div>
            )}

            {job.contact_info && (
              <div className="bg-[var(--bg)] p-4 rounded-xl border border-[var(--border)] shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-[var(--text-secondary)] text-xs font-medium uppercase tracking-wider mb-2">
                  Contact
                </h3>
                <div className="flex items-center">
                  <Phone size={18} className="text-[var(--accent)] mr-2" />
                  <span className="text-[var(--text-primary)] font-semibold">
                    {job.contact_info}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Content Tabs */}
          <div className="mb-8">
            <div className="flex border-b border-[var(--border)] mb-4 overflow-x-auto">
              <button
                onClick={() => setActiveTab('description')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'description' 
                    ? 'border-[var(--accent)] text-[var(--accent)]' 
                    : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Job Description
              </button>
              
              {job.responsibilities && (
                <button
                  onClick={() => setActiveTab('responsibilities')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === 'responsibilities' 
                      ? 'border-[var(--accent)] text-[var(--accent)]' 
                      : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  Responsibilities
                </button>
              )}
              
              {job.qualifications && (
                <button
                  onClick={() => setActiveTab('qualifications')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === 'qualifications' 
                      ? 'border-[var(--accent)] text-[var(--accent)]' 
                      : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  Qualifications
                </button>
              )}
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-[var(--bg)] p-5 md:p-6 rounded-xl border border-[var(--border)] shadow-sm"
              >
                {activeTab === 'description' && formatContent(job.description)}
                {activeTab === 'responsibilities' && formatContent(job.responsibilities)}
                {activeTab === 'qualifications' && formatContent(job.qualifications)}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Skills Section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center">
              Required Skills
            </h2>
            
            <div className="bg-[var(--bg)] p-5 md:p-6 rounded-xl border border-[var(--border)] shadow-sm">
              {/* Parse and display skills */}
              {typeof job.skills_required === 'string' && job.skills_required ? (
                <div>
                  <div className="space-y-4">
                    {(job.skills_required as string).split(',').map((skillGroup, index) => {
                      // Split by colon if it exists
                      const [category, skills] = skillGroup.includes(':') 
                        ? [skillGroup.split(':')[0].trim(), skillGroup.split(':')[1].trim()] 
                        : [null, skillGroup.trim()];
                      
                      return (
                        <div key={index} className="mb-3">
                          {category && (
                            <h3 className="text-md font-medium text-[var(--text-primary)] mb-2 flex items-center">
                              <CheckCircle2 size={18} className="text-[var(--accent)] mr-2" />
                              {category}
                            </h3>
                          )}
                          <div className="flex flex-wrap">
                            {skills.split(',').map((skill, skillIndex) => {
                              const trimmedSkill = skill.trim();
                              if (!trimmedSkill) return null;
                              return (
                                <span
                                  key={skillIndex}
                                  className="inline-flex items-center bg-[var(--accent-light)] text-[var(--accent-dark)] rounded-full px-3 py-1.5 text-sm font-medium mr-2 mb-2 border border-[var(--accent-border)]"
                                >
                                  {trimmedSkill}
                                </span>
                              )
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Good to have skills */}
                  {typeof job.skills_required === 'string' && 
                   job.skills_required && 
                   (job.skills_required as string).toLowerCase().includes("good to have") && (
                    <div className="mt-6">
                      <h3 className="text-md font-medium text-[var(--text-primary)] mb-3 flex items-center">
                        <Star size={18} className="text-amber-500 mr-2" />
                        Good to Have Skills
                      </h3>
                      <div className="flex flex-wrap">
                        {(job.skills_required as string)
                          .substring((job.skills_required as string).toLowerCase().indexOf("good to have"))
                          .replace(/good to have skills:/i, "")
                          .split(',')
                          .map((skill, index) => {
                            const trimmedSkill = skill.trim();
                            if (!trimmedSkill) return null;
                            return (
                              <span
                                key={index}
                                className="inline-flex items-center bg-amber-50 text-amber-700 rounded-full px-3 py-1.5 text-sm font-medium mr-2 mb-2 border border-amber-100"
                              >
                                {trimmedSkill}
                              </span>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* Must Have Skills */}
                  {mustHaveSkills.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-md font-medium text-[var(--text-primary)] mb-3 flex items-center">
                        <CheckCircle2 size={18} className="text-green-500 mr-2" />
                        Must Have Skills
                      </h3>
                      <div className="flex flex-wrap">
                        {mustHaveSkills.map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center bg-green-50 text-green-700 rounded-full px-3 py-1.5 text-sm font-medium mr-2 mb-2 border border-green-100"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Nice to Have Skills */}
                  {niceToHaveSkills.length > 0 && (
                    <div>
                      <h3 className="text-md font-medium text-[var(--text-primary)] mb-3 flex items-center">
                        <Star size={18} className="text-amber-500 mr-2" />
                        Nice to Have Skills
                      </h3>
                      <div className="flex flex-wrap">
                        {niceToHaveSkills.map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center bg-amber-50 text-amber-700 rounded-full px-3 py-1.5 text-sm font-medium mr-2 mb-2 border border-amber-100"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
              
              {/* No Skills Listed */}
              {!job.skills_required && mustHaveSkills.length === 0 && niceToHaveSkills.length === 0 && (
                <p className="text-[var(--text-secondary)] italic">
                  No specific skills listed for this position.
                </p>
              )}
            </div>
          </div>

          {/* Benefits Section */}
          {job.benefits && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
                Benefits & Perks
              </h2>
              <div className="bg-[var(--bg)] p-5 md:p-6 rounded-xl border border-[var(--border)] shadow-sm">
                {formatContent(job.benefits)}
              </div>
            </div>
          )}

          {/* Posted Date */}
          {job.created_at && (
            <div className="text-sm text-[var(--text-secondary)] mt-6 italic">
              Posted on: {formatDate(job.created_at)}
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="sticky bottom-0 p-4 md:p-6 border-t border-[var(--border)] bg-[var(--bg)] flex flex-wrap justify-between items-center gap-4 shadow-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[var(--border)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--border-hover)] transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default JobModal;