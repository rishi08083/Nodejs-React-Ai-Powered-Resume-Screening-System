import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PencilRuler, Save, Edit, X, AlertCircle } from "lucide-react";

import toastService from "../utils/toastService";
import { useToastInit } from "../hooks/useToastInit";

type Candidate = {
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

type ValidationErrors = {
  name: string;
  email: string;
  phone: string;
};

const SkillBadge: React.FC<{
  skill: string;
}> = ({ skill }) => (
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
      <motion.div className="w-full flex items-center justify-between p-4 bg-[var(--surface)] text-left hover:bg-[var(--surface-lighter)] transition-all duration-300">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex-1 flex items-center"
          aria-expanded={isOpen}
        >
          <div className="flex items-center">
            <div className="mr-3 text-[var(--accent)]">{icon}</div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">
              {title}
            </h3>
          </div>
        </button>

        <div
          className="ml-2 text-[var(--accent)] transition-transform duration-300"
          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
          aria-hidden="true"
        >
          <button onClick={() => setIsOpen(!isOpen)}>
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
          </button>
        </div>
      </motion.div>
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
  candidateId: string;
}> = ({ candidateId }) => {
  useToastInit();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [editedCandidate, setEditedCandidate] = useState<Candidate | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Only keeping edit mode for basic information
  const [editingBasic, setEditingBasic] = useState<boolean>(false);

  // Form state for editable fields
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");

  // Validation errors
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({
    name: "",
    email: "",
    phone: "",
  });

  // Function to check if there are actual changes
  const hasChanges = () => {
    if (!candidate) return false;

    return (
      fullName !== candidate.name ||
      email !== candidate.email ||
      phone !== candidate.phone
    );
  };

  // Function to check if data is valid
  const isFormValid = () => {
    return (
      validationErrors.name === "" &&
      validationErrors.email === "" &&
      validationErrors.phone === ""
    );
  };

  // Function to validate all fields
  const validateAllFields = () => {
    validateName(fullName);
    validateEmail(email);
    validatePhone(phone);

    return isFormValid();
  };

  // Name validation
  const validateName = (name: string) => {
    let error = "";
    const trimmedName = name.trim();

    if (!trimmedName) {
      error = "Name is required";
    } else if (trimmedName.length < 2) {
      error = "Name must be at least 2 characters";
    } else if (trimmedName.length > 50) {
      error = "Name must be less than 50 characters";
    } else if (!/^[A-Za-z\s'-]+$/.test(trimmedName)) {
      error = "Name can only contain letters, spaces, hyphens and apostrophes";
    }

    setValidationErrors((prev) => ({ ...prev, name: error }));
    return error === "";
  };

  // Email validation
  const validateEmail = (email: string) => {
    let error = "";
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      error = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      error = "Please enter a valid email address";
    } else if (trimmedEmail.length > 100) {
      error = "Email must be less than 100 characters";
    }

    setValidationErrors((prev) => ({ ...prev, email: error }));
    return error === "";
  };

  // Phone validation
  const validatePhone = (phone: string) => {
    let error = "";
    const trimmedPhone = phone.trim();

    // Optional field
    if (trimmedPhone) {
      // Allow formats like: +1 (123) 456-7890, 123-456-7890, 1234567890
      const phoneRegex =
        /^(\+\d{1,3}\s?)?(\()?\d{3}(\))?[-\s]?\d{3}[-\s]?\d{4}$/;

      if (!phoneRegex.test(trimmedPhone)) {
        error = "Please enter a valid phone number";
      }
    }

    setValidationErrors((prev) => ({ ...prev, phone: error }));
    return error === "";
  };

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
        setCandidate(data.data.resume_obj);
        setEditedCandidate(data.data.resume_obj);

        // Initialize form state with candidate data
        setFullName(data.data.resume_obj.name || "");
        setEmail(data.data.resume_obj.email || "");
        setPhone(data.data.resume_obj.phone || "");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch resume data");
      }
    } catch (error) {
      console.error(error);
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  const saveResumeData = async () => {
    if (!editedCandidate || !hasChanges()) return;

    // Validate all fields before saving
    if (!validateAllFields()) {
      toastService.error("Please fix the validation errors before saving");
      return;
    }

    try {
      setSaveLoading(true);
      setSaveError(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/parsed-resume/update/${candidateId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
          body: JSON.stringify({
            name: fullName,
            email: email,
            phone: phone,
          }),
        }
      );

      if (response.ok) {
        // Update the candidate with new values
        if (candidate) {
          const updatedCandidate = {
            ...candidate,
            name: fullName,
            email: email,
            phone: phone,
          };
          setCandidate(updatedCandidate);
          setEditedCandidate(updatedCandidate);
        }

        toastService.success("Resume data saved successfully!");
        setEditingBasic(false);
        setSaveSuccess(true);

        setTimeout(() => {
          setSaveSuccess(false);
        }, 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save resume data");
      }
    } catch (error) {
      console.error(error);
      setSaveError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
      toastService.error(
        error instanceof Error ? error.message : "Failed to save changes"
      );
    } finally {
      setSaveLoading(false);
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
          <p className="text-[var(--text-secondary)]">{error}</p>
        </div>
      </div>
    );
  }

  if (!candidate || !editedCandidate) {
    return (
      <div className="bg-[var(--bg)] min-h-[200px] p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-[var(--text-secondary)]">
            No candidate data found
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-h-[80vh] overflow-y-auto custom-scrollbar pr-2">
      {/* Header Section - Keeping edit functionality here */}
      <div className="mb-8 bg-[var(--surface)] rounded-xl shadow-lg overflow-hidden border border-[var(--border)]">
        <div className="md:flex">
          <div className="md:flex-shrink-0 bg-[var(--accent)] p-6 flex items-center justify-center">
            <div className="h-24 w-24 rounded-full bg-white/20 flex items-center justify-center text-white text-3xl font-bold">
              {candidate.name && candidate.name.charAt(0)}
            </div>
          </div>
          <div className="p-6 w-full">
            <div className="flex items-center justify-between mb-4">
              <div className="uppercase tracking-wide text-sm text-[var(--accent)] font-semibold">
                {editingBasic ? "Edit Basic Information" : "Parsed Resume Data"}
              </div>
              <div className="flex space-x-2">
                {editingBasic ? (
                  <>
                    <button
                      onClick={() => {
                        // Cancel editing - reset fields to original values
                        setEditingBasic(false);
                        setFullName(candidate.name || "");
                        setEmail(candidate.email || "");
                        setPhone(candidate.phone || "");
                        // Clear any validation errors
                        setValidationErrors({
                          name: "",
                          email: "",
                          phone: "",
                        });
                      }}
                      className="px-3 py-1.5 rounded-md flex items-center gap-1.5 text-[var(--text-secondary)] bg-[var(--surface-lighter)] hover:bg-[var(--border)] transition-colors text-sm"
                      disabled={saveLoading}
                    >
                      <X size={14} />
                      <span>Cancel</span>
                    </button>
                    <button
                      onClick={saveResumeData}
                      className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 ${
                        hasChanges() && isFormValid()
                          ? "bg-[var(--accent)] text-white hover:bg-[var(--accent-darker)]"
                          : "bg-[var(--surface-lighter)] text-[var(--text-secondary)] cursor-not-allowed"
                      } transition-colors text-sm`}
                      disabled={!hasChanges() || !isFormValid() || saveLoading}
                    >
                      {saveLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Save size={14} />
                      )}
                      <span>Save</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditingBasic(true)}
                    className="px-3 py-1.5 rounded-md flex items-center gap-1.5 text-[var(--accent)] bg-[var(--surface-lighter)] hover:bg-[var(--border)] transition-colors text-sm"
                  >
                    <Edit size={14} />
                    <span>Edit</span>
                  </button>
                )}
              </div>
            </div>

            {editingBasic ? (
              <div className="mt-4 space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-[var(--text-secondary)] mb-1"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={fullName}
                    onChange={(e) => {
                      const newName = e.target.value;
                      setFullName(newName);
                      validateName(newName);
                    }}
                    onBlur={() => validateName(fullName)}
                    className={`w-full p-2 border rounded-lg bg-[var(--bg)] text-[var(--text-primary)] ${
                      validationErrors.name
                        ? "border-red-500"
                        : "border-[var(--border)]"
                    }`}
                  />
                  {validationErrors.name && (
                    <div className="mt-1 text-red-500 flex items-center text-xs">
                      <AlertCircle size={12} className="mr-1" />
                      {validationErrors.name}
                    </div>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-[var(--text-secondary)] mb-1"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => {
                      const newEmail = e.target.value;
                      setEmail(newEmail);
                      validateEmail(newEmail);
                    }}
                    onBlur={() => validateEmail(email)}
                    className={`w-full p-2 border rounded-lg bg-[var(--bg)] text-[var(--text-primary)] ${
                      validationErrors.email
                        ? "border-red-500"
                        : "border-[var(--border)]"
                    }`}
                  />
                  {validationErrors.email && (
                    <div className="mt-1 text-red-500 flex items-center text-xs">
                      <AlertCircle size={12} className="mr-1" />
                      {validationErrors.email}
                    </div>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-[var(--text-secondary)] mb-1"
                  >
                    Phone (optional)
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={phone}
                    onChange={(e) => {
                      const newPhone = e.target.value;
                      setPhone(newPhone);
                      validatePhone(newPhone);
                    }}
                    onBlur={() => validatePhone(phone)}
                    className={`w-full p-2 border rounded-lg bg-[var(--bg)] text-[var(--text-primary)] ${
                      validationErrors.phone
                        ? "border-red-500"
                        : "border-[var(--border)]"
                    }`}
                    placeholder="e.g., +1 (123) 456-7890"
                  />
                  {validationErrors.phone && (
                    <div className="mt-1 text-red-500 flex items-center text-xs">
                      <AlertCircle size={12} className="mr-1" />
                      {validationErrors.phone}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
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
                    <div className="w-full overflow-hidden">
                      <p className="text-sm text-[var(--text-secondary)]">
                        Email
                      </p>
                      {candidate.email ? (
                        <div className="flex items-center">
                          <a
                            href={`mailto:${candidate.email}`}
                            className="font-medium text-[var(--text-primary)] underline hover:text-[var(--accent)] transition-colors mr-2 truncate"
                            title={candidate.email}
                          >
                            {candidate.email}
                          </a>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(candidate.email);
                              toastService.success(
                                "Email copied to clipboard!"
                              );
                            }}
                            className="p-1 text-[var(--text-secondary)] hover:text-[var(--accent)] rounded-full hover:bg-[var(--surface-lighter)] flex-shrink-0"
                            title="Copy email"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <rect
                                x="9"
                                y="9"
                                width="13"
                                height="13"
                                rx="2"
                                ry="2"
                              ></rect>
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <p className="font-medium text-[var(--text-secondary)]">
                          Not provided
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Skills Section - Read Only */}
      <AccordionItem title="Skills" defaultOpen={true} icon={<PencilRuler />}>
        <div
          className={`flex flex-wrap ${candidate.skills && candidate.skills.length > 15 ? "max-h-60 overflow-y-auto custom-scrollbar pr-2" : ""}`}
        >
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

      {/* Experience Section - Read Only */}
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
        <div
          className={`space-y-4 ${candidate.experience && candidate.experience.length > 3 ? "max-h-72 overflow-y-auto custom-scrollbar pr-2" : ""}`}
        >
          {candidate.experience && candidate.experience.length > 0 ? (
            candidate.experience.map((exp, index) => (
              <div
                key={index}
                className="border-l-4 border-[var(--accent)] pl-4 py-1 relative"
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
            ))
          ) : (
            <p className="text-[var(--text-secondary)]">
              No work experience listed
            </p>
          )}
        </div>
      </AccordionItem>

      {/* Education Section - Read Only */}
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
        <div
          className={`space-y-4 ${candidate.education && candidate.education.length > 3 ? "max-h-72 overflow-y-auto custom-scrollbar pr-2" : ""}`}
        >
          {candidate.education && candidate.education.length > 0 ? (
            candidate.education.map((edu, index) => (
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
            ))
          ) : (
            <p className="text-[var(--text-secondary)]">No education listed</p>
          )}
        </div>
      </AccordionItem>

      {/* Locations Section - Read Only */}
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
        <div
          className={`flex flex-wrap ${candidate.locations && candidate.locations.length > 8 ? "max-h-40 overflow-y-auto custom-scrollbar pr-2" : ""}`}
        >
          {candidate.locations && candidate.locations.length > 0 ? (
            candidate.locations.map((location, index) => (
              <span
                key={index}
                className="inline-block bg-[var(--surface-lighter)] text-[var(--text-primary)] rounded-full px-3 py-1 text-sm font-medium mr-2 mb-2"
              >
                {location}
              </span>
            ))
          ) : (
            <p className="text-[var(--text-secondary)]">
              No location preferences listed
            </p>
          )}
        </div>
      </AccordionItem>
    </div>
  );
};

export default ParseCandidate;
