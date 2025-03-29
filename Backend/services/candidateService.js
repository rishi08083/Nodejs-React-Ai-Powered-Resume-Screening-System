const db = require("../models"); // Ensure models are properly set

async function getCandidateDetails(candidate_id) {
    try {
        const candidate = await db.Candidates.findByPk(candidate_id);

        if (!candidate) return null; // Return null if candidate is not found

        const candidate_skills = await candidate.getSkills();
        const candidate_experience = await candidate.getExperiences();
        const job_detail_candidate = await db.Jobs.findByPk(candidate.job_id);

        if (!job_detail_candidate) {
            console.warn(`No job details found for job_id: ${candidate.job_id}`);
            return null;
        }

        // Calculate total experience in years (formatted like 1.2)
        let totalMonthsExperience = 0;
        const currentDate = new Date();

        candidate_experience.forEach((exp) => {
            const startDate = exp.start_date ? new Date(exp.start_date) : null;
            const endDate = exp.end_date ? new Date(exp.end_date) : currentDate; // Assume still working if no end_date

            if (startDate) {
                const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 +
                    (endDate.getMonth() - startDate.getMonth());
                totalMonthsExperience += Math.max(months, 0);
            }
        });

        const totalExperience = (totalMonthsExperience / 12).toFixed(1) + " years"; // Converts to "X.Y years"

        // Extract all skill names
        const skillNames = candidate_skills.map(skill => skill.skill_names);

        // Extract all job titles
        const experienceTitles = candidate_experience.map(exp => exp.job_titles);

        // Extract only the filename from rcd_url
        const rcd_file_key = job_detail_candidate.rcd_url ? job_detail_candidate.rcd_url.split('/').pop() : "";

        const response = {
            jd: {
                title: job_detail_candidate.title || "",
                req_experience: job_detail_candidate.experience_required || "",
                req_skills: job_detail_candidate.skills_required
                    ? job_detail_candidate.skills_required.split(",")
                    : [],
            },
            rcd_file_key,
            candidate: {
                skill: skillNames,
                experience: {
                    titles: experienceTitles,
                    experience: totalExperience,
                }
            }
        };

        return response;
    } catch (error) {
        console.error("Error fetching candidate details:", error);
        return null;
    }
}

module.exports = { getCandidateDetails };
