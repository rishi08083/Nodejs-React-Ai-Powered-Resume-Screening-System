import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PencilRuler, Save, Edit, X, Plus, Trash2 } from "lucide-react";

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

const SkillBadge: React.FC<{
  skill: string;
  isEditing: boolean;
  onRemove: () => void;
}> = ({ skill, isEditing, onRemove }) => (
  <span
    className={`inline-block bg-[var(--surface)] text-[var(--accent)] rounded-full px-3 py-1 text-sm font-medium mr-2 mb-2 border border-[var(--border)] ${isEditing ? "pr-1" : ""}`}
  >
    {skill}
    {isEditing && (
      <button
        onClick={onRemove}
        className="ml-2 text-red-400 hover:text-red-600 transition-colors"
        aria-label="Remove skill"
      >
        <X size={14} />
      </button>
    )}
  </span>
);

const AccordionItem: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  onEdit?: () => void;
  isEditing?: boolean;
  canEdit?: boolean;
}> = ({
  title,
  icon,
  children,
  defaultOpen = false,
  onEdit,
  isEditing,
  canEdit = true,
}) => {
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

        {canEdit && (
          <button
            onClick={onEdit}
            className={`ml-2 p-1.5 rounded-full ${
              isEditing
                ? "bg-green-100 text-green-600 hover:bg-green-200"
                : "bg-[var(--surface-lighter)] text-[var(--accent)] hover:bg-[var(--border)]"
            } 
              transition-colors`}
            aria-label={isEditing ? "Save changes" : "Edit content"}
          >
            {isEditing ? <Save size={16} /> : <Edit size={16} />}
          </button>
        )}

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
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [editedCandidate, setEditedCandidate] = useState<Candidate | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Edit mode states
  const [editingBasic, setEditingBasic] = useState<boolean>(false);
  const [editingSkills, setEditingSkills] = useState<boolean>(false);
  const [editingExperience, setEditingExperience] = useState<boolean>(false);
  const [editingEducation, setEditingEducation] = useState<boolean>(false);
  const [editingLocations, setEditingLocations] = useState<boolean>(false);

  // New item states
  const [newSkill, setNewSkill] = useState<string>("");
  const [newLocation, setNewLocation] = useState<string>("");
  const [newExperience, setNewExperience] = useState({
    company: "",
    job_title: "",
    start_date: "",
    end_date: "",
  });
  const [newEducation, setNewEducation] = useState({
    College: "",
    Degree: "",
    start_date: "",
    end_date: "",
  });

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
    if (!editedCandidate) return;

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
            resume_obj: JSON.stringify(editedCandidate),
          }),
        }
      );

      if (response.ok) {
        setSaveSuccess(true);
        setCandidate(editedCandidate);

        // Reset edit states
        setEditingBasic(false);
        setEditingSkills(false);
        setEditingExperience(false);
        setEditingEducation(false);
        setEditingLocations(false);

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
    } finally {
      setSaveLoading(false);
    }
  };

  useEffect(() => {
    if (candidateId) {
      getParseResume(candidateId);
    }
  }, [candidateId]);

  // Handlers for editing
  const handleAddSkill = () => {
    if (!newSkill.trim() || !editedCandidate) return;

    setEditedCandidate({
      ...editedCandidate,
      skills: [...(editedCandidate.skills || []), newSkill.trim()],
    });

    setNewSkill("");
  };

  const handleRemoveSkill = (index: number) => {
    if (!editedCandidate) return;

    const updatedSkills = [...editedCandidate.skills];
    updatedSkills.splice(index, 1);

    setEditedCandidate({
      ...editedCandidate,
      skills: updatedSkills,
    });
  };

  const handleAddExperience = () => {
    if (!editedCandidate) return;
    if (!newExperience.company.trim() || !newExperience.job_title.trim())
      return;

    setEditedCandidate({
      ...editedCandidate,
      experience: [...(editedCandidate.experience || []), newExperience],
    });

    setNewExperience({
      company: "",
      job_title: "",
      start_date: "",
      end_date: "",
    });
  };

  const handleRemoveExperience = (index: number) => {
    if (!editedCandidate || !editedCandidate.experience) return;

    const updatedExperience = [...editedCandidate.experience];
    updatedExperience.splice(index, 1);

    setEditedCandidate({
      ...editedCandidate,
      experience: updatedExperience,
    });
  };

  const handleUpdateExperience = (
    index: number,
    field: string,
    value: string
  ) => {
    if (!editedCandidate || !editedCandidate.experience) return;

    const updatedExperience = [...editedCandidate.experience];
    updatedExperience[index] = {
      ...updatedExperience[index],
      [field]: value,
    };

    setEditedCandidate({
      ...editedCandidate,
      experience: updatedExperience,
    });
  };

  const handleAddEducation = () => {
    if (!editedCandidate) return;
    if (!newEducation.College.trim() || !newEducation.Degree.trim()) return;

    setEditedCandidate({
      ...editedCandidate,
      education: [...(editedCandidate.education || []), newEducation],
    });

    setNewEducation({
      College: "",
      Degree: "",
      start_date: "",
      end_date: "",
    });
  };

  const handleRemoveEducation = (index: number) => {
    if (!editedCandidate || !editedCandidate.education) return;

    const updatedEducation = [...editedCandidate.education];
    updatedEducation.splice(index, 1);

    setEditedCandidate({
      ...editedCandidate,
      education: updatedEducation,
    });
  };

  const handleUpdateEducation = (
    index: number,
    field: string,
    value: string
  ) => {
    if (!editedCandidate || !editedCandidate.education) return;

    const updatedEducation = [...editedCandidate.education];
    updatedEducation[index] = {
      ...updatedEducation[index],
      [field]: value,
    };

    setEditedCandidate({
      ...editedCandidate,
      education: updatedEducation,
    });
  };

  const handleAddLocation = () => {
    if (!newLocation.trim() || !editedCandidate) return;

    setEditedCandidate({
      ...editedCandidate,
      locations: [...(editedCandidate.locations || []), newLocation.trim()],
    });

    setNewLocation("");
  };

  const handleRemoveLocation = (index: number) => {
    if (!editedCandidate || !editedCandidate.locations) return;

    const updatedLocations = [...editedCandidate.locations];
    updatedLocations.splice(index, 1);

    setEditedCandidate({
      ...editedCandidate,
      locations: updatedLocations,
    });
  };

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
      {/* Save Status Messages */}
      {saveSuccess && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg flex items-center justify-between">
          <span>Resume data saved successfully!</span>
          <button onClick={() => setSaveSuccess(false)} className="p-1">
            <X size={16} />
          </button>
        </div>
      )}

      {saveError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center justify-between">
          <span>{saveError}</span>
          <button onClick={() => setSaveError(null)} className="p-1">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header Section */}
      <div className="mb-8 bg-[var(--surface)] rounded-xl shadow-lg overflow-hidden border border-[var(--border)]">
        <div className="md:flex">
          <div className="md:flex-shrink-0 bg-[var(--accent)] p-6 flex items-center justify-center">
            <div className="h-24 w-24 rounded-full bg-white/20 flex items-center justify-center text-white text-3xl font-bold">
              {editedCandidate.name && editedCandidate.name.charAt(0)}
            </div>
          </div>
          <div className="p-6 w-full">
            <div className="flex items-center justify-between">
              <div className="uppercase tracking-wide text-sm text-[var(--accent)] font-semibold">
                {editingBasic ? "Edit Basic Information" : "Parsed Resume Data"}
              </div>
              <button
                onClick={() => {
                  if (editingBasic) {
                    saveResumeData();
                  }
                  setEditingBasic(!editingBasic);
                }}
                className={`p-1.5 rounded-full ${
                  editingBasic
                    ? "bg-green-100 text-green-600 hover:bg-green-200"
                    : "bg-[var(--surface-lighter)] text-[var(--accent)] hover:bg-[var(--border)]"
                } 
                  transition-colors`}
                disabled={saveLoading}
              >
                {editingBasic ? <Save size={16} /> : <Edit size={16} />}
              </button>
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
                    value={editedCandidate.name}
                    onChange={(e) =>
                      setEditedCandidate({
                        ...editedCandidate,
                        name: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-[var(--border)] rounded-lg bg-[var(--bg)] text-[var(--text-primary)]"
                  />
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
                    value={editedCandidate.email}
                    onChange={(e) =>
                      setEditedCandidate({
                        ...editedCandidate,
                        email: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-[var(--border)] rounded-lg bg-[var(--bg)] text-[var(--text-primary)]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-[var(--text-secondary)] mb-1"
                  >
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={editedCandidate.phone}
                    onChange={(e) =>
                      setEditedCandidate({
                        ...editedCandidate,
                        phone: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-[var(--border)] rounded-lg bg-[var(--bg)] text-[var(--text-primary)]"
                  />
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-[var(--text-primary)] mt-1">
                  {editedCandidate.name}
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
                      {editedCandidate.phone ? (
                        <a
                          href={`tel:${editedCandidate.phone}`}
                          className="font-medium text-[var(--text-primary)] underline hover:text-[var(--accent)] transition-colors"
                        >
                          {editedCandidate.phone}
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
                      {editedCandidate.email ? (
                        <a
                          href={`mailto:${editedCandidate.email}`}
                          className="font-medium text-[var(--text-primary)] underline hover:text-[var(--accent)] transition-colors"
                        >
                          {editedCandidate.email}
                        </a>
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

      {/* Skills Section */}
      <AccordionItem
        title="Skills"
        defaultOpen={true}
        icon={<PencilRuler />}
        onEdit={() => {
          if (editingSkills) {
            saveResumeData();
          }
          setEditingSkills(!editingSkills);
        }}
        isEditing={editingSkills}
      >
        {editingSkills && (
          <div className="mb-4 flex items-center">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddSkill();
                }
              }}
              placeholder="Add new skill"
              className="flex-1 p-2 border border-[var(--border)] rounded-l-lg bg-[var(--bg)] text-[var(--text-primary)]"
            />
            <button
              onClick={handleAddSkill}
              className="p-2 bg-[var(--accent)] text-white rounded-r-lg hover:bg-[var(--accent-hover)] transition-colors"
              disabled={!newSkill.trim()}
            >
              <Plus size={18} />
            </button>
          </div>
        )}

        <div
          className={`flex flex-wrap ${editedCandidate.skills && editedCandidate.skills.length > 15 ? "max-h-60 overflow-y-auto custom-scrollbar pr-2" : ""}`}
        >
          {editedCandidate.skills && editedCandidate.skills.length > 0 ? (
            editedCandidate.skills.map((skill, index) => (
              <SkillBadge
                key={index}
                skill={skill}
                isEditing={editingSkills}
                onRemove={() => handleRemoveSkill(index)}
              />
            ))
          ) : (
            <p className="text-[var(--text-secondary)]">No skills listed</p>
          )}
        </div>
        {editedCandidate.skills && editedCandidate.skills.length > 20 && (
          <p className="text-[var(--text-secondary)] mt-4 text-sm">
            <em>
              This candidate has {editedCandidate.skills.length} skills in total
            </em>
          </p>
        )}
      </AccordionItem>

      {/* Experience Section */}
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
        onEdit={() => {
          if (editingExperience) {
            saveResumeData();
          }
          setEditingExperience(!editingExperience);
        }}
        isEditing={editingExperience}
      >
        {editingExperience && (
          <div className="mb-6 p-4 border border-[var(--border)] rounded-lg bg-[var(--bg)]">
            <h4 className="font-medium text-[var(--text-primary)] mb-3">
              Add Experience
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Job Title
                </label>
                <input
                  type="text"
                  value={newExperience.job_title}
                  onChange={(e) =>
                    setNewExperience({
                      ...newExperience,
                      job_title: e.target.value,
                    })
                  }
                  className="w-full p-2 border border-[var(--border)] rounded-lg bg-[var(--surface-lighter)] text-[var(--text-primary)]"
                  placeholder="Job Title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Company
                </label>
                <input
                  type="text"
                  value={newExperience.company}
                  onChange={(e) =>
                    setNewExperience({
                      ...newExperience,
                      company: e.target.value,
                    })
                  }
                  className="w-full p-2 border border-[var(--border)] rounded-lg bg-[var(--surface-lighter)] text-[var(--text-primary)]"
                  placeholder="Company Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Start Date
                </label>
                <input
                  type="text"
                  value={newExperience.start_date}
                  onChange={(e) =>
                    setNewExperience({
                      ...newExperience,
                      start_date: e.target.value,
                    })
                  }
                  className="w-full p-2 border border-[var(--border)] rounded-lg bg-[var(--surface-lighter)] text-[var(--text-primary)]"
                  placeholder="e.g., Jan 2020"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  End Date
                </label>
                <input
                  type="text"
                  value={newExperience.end_date}
                  onChange={(e) =>
                    setNewExperience({
                      ...newExperience,
                      end_date: e.target.value,
                    })
                  }
                  className="w-full p-2 border border-[var(--border)] rounded-lg bg-[var(--surface-lighter)] text-[var(--text-primary)]"
                  placeholder="e.g., Present"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleAddExperience}
                className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent-hover)] transition-colors"
                disabled={!newExperience.job_title || !newExperience.company}
              >
                Add Experience
              </button>
            </div>
          </div>
        )}

        <div
          className={`space-y-4 ${editedCandidate.experience && editedCandidate.experience.length > 3 ? "max-h-72 overflow-y-auto custom-scrollbar pr-2" : ""}`}
        >
          {editedCandidate.experience &&
          editedCandidate.experience.length > 0 ? (
            editedCandidate.experience.map((exp, index) => (
              <div
                key={index}
                className="border-l-4 border-[var(--accent)] pl-4 py-1 relative"
              >
                {editingExperience ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                    <div>
                      <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                        Job Title
                      </label>
                      <input
                        type="text"
                        value={exp.job_title}
                        onChange={(e) =>
                          handleUpdateExperience(
                            index,
                            "job_title",
                            e.target.value
                          )
                        }
                        className="w-full p-1 text-sm border border-[var(--border)] rounded-lg bg-[var(--surface-lighter)] text-[var(--text-primary)]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                        Company
                      </label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) =>
                          handleUpdateExperience(
                            index,
                            "company",
                            e.target.value
                          )
                        }
                        className="w-full p-1 text-sm border border-[var(--border)] rounded-lg bg-[var(--surface-lighter)] text-[var(--text-primary)]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                        Start Date
                      </label>
                      <input
                        type="text"
                        value={exp.start_date}
                        onChange={(e) =>
                          handleUpdateExperience(
                            index,
                            "start_date",
                            e.target.value
                          )
                        }
                        className="w-full p-1 text-sm border border-[var(--border)] rounded-lg bg-[var(--surface-lighter)] text-[var(--text-primary)]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                        End Date
                      </label>
                      <input
                        type="text"
                        value={exp.end_date}
                        onChange={(e) =>
                          handleUpdateExperience(
                            index,
                            "end_date",
                            e.target.value
                          )
                        }
                        className="w-full p-1 text-sm border border-[var(--border)] rounded-lg bg-[var(--surface-lighter)] text-[var(--text-primary)]"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <h4 className="font-medium text-[var(--text-primary)]">
                      {exp.job_title}
                    </h4>
                    <span className="bg-[var(--surface-lighter)] text-[var(--text-secondary)] text-xs px-2 py-1 rounded">
                      {exp.start_date} - {exp.end_date || "Present"}
                    </span>
                  </div>
                )}

                {!editingExperience ? (
                  <p className="text-[var(--text-secondary)]">{exp.company}</p>
                ) : (
                  <button
                    onClick={() => handleRemoveExperience(index)}
                    className="mt-2 flex items-center text-xs text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 size={14} className="mr-1" />
                    Remove
                  </button>
                )}
              </div>
            ))
          ) : (
            <p className="text-[var(--text-secondary)]">
              No work experience listed
            </p>
          )}
        </div>
      </AccordionItem>

      {/* Education Section */}
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
        onEdit={() => {
          if (editingEducation) {
            saveResumeData();
          }
          setEditingEducation(!editingEducation);
        }}
        isEditing={editingEducation}
      >
        {editingEducation && (
          <div className="mb-6 p-4 border border-[var(--border)] rounded-lg bg-[var(--bg)]">
            <h4 className="font-medium text-[var(--text-primary)] mb-3">
              Add Education
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Degree
                </label>
                <input
                  type="text"
                  value={newEducation.Degree}
                  onChange={(e) =>
                    setNewEducation({ ...newEducation, Degree: e.target.value })
                  }
                  className="w-full p-2 border border-[var(--border)] rounded-lg bg-[var(--surface-lighter)] text-[var(--text-primary)]"
                  placeholder="Degree Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Institution
                </label>
                <input
                  type="text"
                  value={newEducation.College}
                  onChange={(e) =>
                    setNewEducation({
                      ...newEducation,
                      College: e.target.value,
                    })
                  }
                  className="w-full p-2 border border-[var(--border)] rounded-lg bg-[var(--surface-lighter)] text-[var(--text-primary)]"
                  placeholder="College or University"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Start Date
                </label>
                <input
                  type="text"
                  value={newEducation.start_date}
                  onChange={(e) =>
                    setNewEducation({
                      ...newEducation,
                      start_date: e.target.value,
                    })
                  }
                  className="w-full p-2 border border-[var(--border)] rounded-lg bg-[var(--surface-lighter)] text-[var(--text-primary)]"
                  placeholder="e.g., 2018"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  End Date
                </label>
                <input
                  type="text"
                  value={newEducation.end_date}
                  onChange={(e) =>
                    setNewEducation({
                      ...newEducation,
                      end_date: e.target.value,
                    })
                  }
                  className="w-full p-2 border border-[var(--border)] rounded-lg bg-[var(--surface-lighter)] text-[var(--text-primary)]"
                  placeholder="e.g., 2022"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleAddEducation}
                className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent-hover)] transition-colors"
                disabled={!newEducation.Degree || !newEducation.College}
              >
                Add Education
              </button>
            </div>
          </div>
        )}

        <div
          className={`space-y-4 ${editedCandidate.education && editedCandidate.education.length > 3 ? "max-h-72 overflow-y-auto custom-scrollbar pr-2" : ""}`}
        >
          {editedCandidate.education && editedCandidate.education.length > 0 ? (
            editedCandidate.education.map((edu, index) => (
              <div
                key={index}
                className="border-l-4 border-[var(--accent)] pl-4 py-1"
              >
                {editingEducation ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                    <div>
                      <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                        Degree
                      </label>
                      <input
                        type="text"
                        value={edu.Degree}
                        onChange={(e) =>
                          handleUpdateEducation(index, "Degree", e.target.value)
                        }
                        className="w-full p-1 text-sm border border-[var(--border)] rounded-lg bg-[var(--surface-lighter)] text-[var(--text-primary)]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                        Institution
                      </label>
                      <input
                        type="text"
                        value={edu.College}
                        onChange={(e) =>
                          handleUpdateEducation(
                            index,
                            "College",
                            e.target.value
                          )
                        }
                        className="w-full p-1 text-sm border border-[var(--border)] rounded-lg bg-[var(--surface-lighter)] text-[var(--text-primary)]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                        Start Date
                      </label>
                      <input
                        type="text"
                        value={edu.start_date}
                        onChange={(e) =>
                          handleUpdateEducation(
                            index,
                            "start_date",
                            e.target.value
                          )
                        }
                        className="w-full p-1 text-sm border border-[var(--border)] rounded-lg bg-[var(--surface-lighter)] text-[var(--text-primary)]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                        End Date
                      </label>
                      <input
                        type="text"
                        value={edu.end_date}
                        onChange={(e) =>
                          handleUpdateEducation(
                            index,
                            "end_date",
                            e.target.value
                          )
                        }
                        className="w-full p-1 text-sm border border-[var(--border)] rounded-lg bg-[var(--surface-lighter)] text-[var(--text-primary)]"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <h4 className="font-medium text-[var(--text-primary)]">
                      {edu.Degree}
                    </h4>
                    <span className="bg-[var(--surface-lighter)] text-[var(--text-secondary)] text-xs px-2 py-1 rounded">
                      {edu.start_date} - {edu.end_date || "Present"}
                    </span>
                  </div>
                )}

                {!editingEducation ? (
                  <p className="text-[var(--text-secondary)]">{edu.College}</p>
                ) : (
                  <button
                    onClick={() => handleRemoveEducation(index)}
                    className="mt-2 flex items-center text-xs text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 size={14} className="mr-1" />
                    Remove
                  </button>
                )}
              </div>
            ))
          ) : (
            <p className="text-[var(--text-secondary)]">No education listed</p>
          )}
        </div>
      </AccordionItem>

      {/* Locations Section */}
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
        onEdit={() => {
          if (editingLocations) {
            saveResumeData();
          }
          setEditingLocations(!editingLocations);
        }}
        isEditing={editingLocations}
      >
        {editingLocations && (
          <div className="mb-4 flex items-center">
            <input
              type="text"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddLocation();
                }
              }}
              placeholder="Add location preference"
              className="flex-1 p-2 border border-[var(--border)] rounded-l-lg bg-[var(--bg)] text-[var(--text-primary)]"
            />
            <button
              onClick={handleAddLocation}
              className="p-2 bg-[var(--accent)] text-white rounded-r-lg hover:bg-[var(--accent-hover)] transition-colors"
              disabled={!newLocation.trim()}
            >
              <Plus size={18} />
            </button>
          </div>
        )}

        <div
          className={`flex flex-wrap ${editedCandidate.locations && editedCandidate.locations.length > 8 ? "max-h-40 overflow-y-auto custom-scrollbar pr-2" : ""}`}
        >
          {editedCandidate.locations && editedCandidate.locations.length > 0 ? (
            editedCandidate.locations.map((location, index) => (
              <span
                key={index}
                className="inline-block bg-[var(--surface-lighter)] text-[var(--text-primary)] rounded-full px-3 py-1 text-sm font-medium mr-2 mb-2"
              >
                {location}
                {editingLocations && (
                  <button
                    onClick={() => handleRemoveLocation(index)}
                    className="ml-2 text-red-400 hover:text-red-600 transition-colors"
                    aria-label="Remove location"
                  >
                    <X size={14} />
                  </button>
                )}
              </span>
            ))
          ) : (
            <p className="text-[var(--text-secondary)]">
              No location preferences listed
            </p>
          )}
        </div>
      </AccordionItem>

      {/* Actions Footer */}
      <div className="mt-8 flex justify-end">
        {(editingBasic ||
          editingSkills ||
          editingExperience ||
          editingEducation ||
          editingLocations) && (
          <button
            onClick={saveResumeData}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center shadow-md"
            disabled={saveLoading}
          >
            {saveLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            ) : (
              <Save size={18} className="mr-2" />
            )}
            Save All Changes
          </button>
        )}
      </div>
    </div>
  );
};

export default ParseCandidate;
