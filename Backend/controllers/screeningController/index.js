const db = require("../../models"); // Load models
const axios = require("axios");

const screenCandidate = async (req, res) => {
    try {
        const { candidate_id } = req.body;
        console.log("Received Request:", req.body);

        if (!candidate_id) {
            return res.status(400).json({ status: "error", message: "Missing candidate_id" });
        }

        // Fetch candidate details
        const candidateDetails = await getCandidateDetails(candidate_id);
        if (!candidateDetails) {
            return res.status(404).json({ status: "error", message: "Candidate not found" });
        }

        console.log("Candidate Details Response:", JSON.stringify(candidateDetails, null, 2));

        // Prepare request for AI screening
        const requestBody = {
            jd: candidateDetails.jd,
            rcd_file_key: candidateDetails.rcd_file_key,
            candidate: candidateDetails.candidate,
        };

        console.log("Prepared Request for AI Screening:", JSON.stringify(requestBody, null, 2));
        const FastAPI_server_url = process.env.AI_BACKEND_URL;
        if (!FastAPI_server_url) {
            return res.json({ status: "error", message: "env FastAPI_server_url not present" });
        }
        
        // Call FastAPI to get AI screening results

        const aiResponse = await axios.post(`${FastAPI_server_url}/screen_candidates_2`, requestBody);

        // Check if screening already exists and update it
        const existingScreening = await db.ScreeningResults.findOne({ where: { candidate_id } });
        if (existingScreening) {
            await existingScreening.update({
                job_id: candidateDetails.jd.job_id,
                user_id: candidateDetails.user_id,
                match_score: aiResponse.data.Combined_Score,
                status_of: aiResponse.data.status === "success",
                missing_skills: aiResponse.data.missing_skills || [],
                is_deleted: false,
                feedback_json: aiResponse.data,
            });
        } else {
            // Save AI response to DB if not exists
            await saveScreeningResult({
                candidate_id,
                job_id: candidateDetails.jd.job_id,
                user_id: candidateDetails.user_id,
                match_score: aiResponse.data.Combined_Score,
                status_of: aiResponse.data.status === "success",
                missing_skills: aiResponse.data.missing_skills || [],
                is_deleted: false,
                feedback_json: aiResponse.data,
            });
        }

        res.json({ status: "success", message: "AI Screening completed and data updated successfully!" });
    } catch (error) {
        console.error("Error in AI Screening:", error);
        res.status(500).json({ status: "error", message: "Internal Server Error" });
    }
}

const getFeedback = async (req, res) => {
    try {
        const { candidate_id } = req.params;
        console.log("Fetching feedback for candidate_id:", candidate_id);

        const feedback = await getFeedbackByCandidateId(candidate_id);

        if (!feedback) {
            return res.status(404).json({ status: "error", message: "No feedback found for this candidate." });
        }

        res.json({ status: "success", message: "Feedback retrieved successfully.", data: feedback });
    } catch (error) {
        console.error("Error fetching feedback:", error);
        res.status(500).json({ status: "error", message: "Internal Server Error" });
    }
}



// Get candidate details for AI screening
async function getCandidateDetails(candidate_id) {
    try {
        const candidate = await db.Candidates.findByPk(candidate_id);

        if (!candidate) return null;

        const candidate_skills = await candidate.getSkills();
        const candidate_experience = await candidate.getExperiences();
        const job_detail_candidate = await db.Jobs.findByPk(candidate.job_id);

        if (!job_detail_candidate) {
            console.warn(`No job details found for job_id: ${candidate.job_id}`);
            return null;
        }

        // Calculate total experience in years
        let totalMonthsExperience = 0;
        const currentDate = new Date();

        candidate_experience.forEach((exp) => {
            const startDate = exp.start_date ? new Date(exp.start_date) : null;
            const endDate = exp.end_date ? new Date(exp.end_date) : currentDate;

            if (startDate) {
                const months =
                    (endDate.getFullYear() - startDate.getFullYear()) * 12 +
                    (endDate.getMonth() - startDate.getMonth());
                totalMonthsExperience += Math.max(months, 0);
            }
        });

        const totalExperience = (totalMonthsExperience / 12).toFixed(1) + " years";

        // Get all skill names
        const skillNames = candidate_skills.flatMap((skill) => skill.skill_names);

        // Get job titles from experience
        const experienceTitles = candidate_experience.map((exp) => exp.job_titles);

        // Extract file key from rcd_url
        const rcd_file_key = job_detail_candidate.rcd_url
            ? job_detail_candidate.rcd_url.split("/").pop()
            : "";

        // Format required skills
        const req_skills = job_detail_candidate.skills_required
            ? job_detail_candidate.skills_required.split(",").map((skill) => skill.trim()).join(", ")
            : "";

        // Prepare final response
        const response = {
            jd: {
                title: job_detail_candidate.title || "",
                req_experience: job_detail_candidate.experience_required || "",
                req_skills,
            },
            rcd_file_key,
            candidate: {
                skill: skillNames,
                experience: {
                    titles: experienceTitles,
                    experience: totalExperience,
                },
            },
        };

        return response;
    } catch (error) {
        console.error("Error fetching candidate details:", error);
        return null;
    }
}

// Save AI screening results to DB
async function saveScreeningResult(resultData) {
    const { candidate_id, match_score, status_of, missing_skills, is_deleted, feedback_json } = resultData;

    try {
        // Get candidate data to fetch job_id and user_id dynamically
        const candidate = await db.Candidates.findByPk(candidate_id);
        if (!candidate) {
            throw new Error(`Candidate not found with id: ${candidate_id}`);
        }

        // Dynamically get user_id and job_id from candidate
        const { job_id, user_id } = candidate;

        // Save in ScreeningResults table
        const result = await db.ScreeningResults.create({
            candidate_id,
            job_id, // Save correct job_id
            user_id, // Save correct user_id
            match_score,
            status_of,
            missing_skills,
            is_deleted: is_deleted || false,
        });

        // Save feedback in Feedback table
        await db.Feedback.create({
            candidate_id,
            feedback_text: JSON.stringify(feedback_json), // Store full AI response JSON
            rating: Math.round(match_score),
            given_by: "AI Screening",
            is_deleted: false,
        });

        // Update match_score in Candidates table
        await db.Candidates.update(
            {
                match_score: Math.round(match_score),
            },
            { where: { id: candidate_id } }
        );

        return result;
    } catch (error) {
        console.error("Error saving screening result:", error.message || error);
        throw new Error("Failed to save screening result.");
    }
}

// Fetch feedback by candidate_id
async function getFeedbackByCandidateId(candidate_id) {
    try {
        // Get feedback from Feedback table
        const feedback = await db.Feedback.findAll({
            where: { candidate_id, is_deleted: false },
            attributes: ["id", "candidate_id", "feedback_text", "rating", "given_by", "created_at"],
            order: [["created_at", "DESC"]], // Show latest feedback first
        });

        if (feedback.length === 0) {
            return null;
        }

        // Format feedback_text as parsed JSON
        const formattedFeedback = feedback.map((entry) => ({
            id: entry.id,
            candidate_id: entry.candidate_id,
            feedback_text: JSON.parse(entry.feedback_text),
            rating: entry.rating,
            given_by: entry.given_by,
            created_at: entry.created_at,
        }));

        return formattedFeedback;
    } catch (error) {
        console.error("Error fetching feedback:", error.message || error);
        throw new Error("Failed to fetch feedback.");
    }
}

module.exports = {
    screenCandidate,
    getFeedback
};