// Get candidate details for AI screening
const db = require("../models");
const axios = require("axios");
const { generateToken } = require("./tokenGeneration");

module.exports.getCandidateDetails = async (candidate_id) => {
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
    const experienceTitles = candidate_experience
      .map((exp) => exp.job_titles || "")
      .filter(Boolean);

    // Extract file key from rcd_url
    const rcd_file_key = job_detail_candidate.rcd_url
      ? job_detail_candidate.rcd_url.split("/").pop()
      : "";

    // Format required skills
    const req_skills = job_detail_candidate.skills_required
      ? job_detail_candidate.skills_required
          .split(",")
          .map((skill) => skill.trim())
          .join(", ")
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
};

// Save AI screening results to DB
module.exports.saveScreeningResult = async (resultData) => {
  const {
    candidate_id,
    match_score,
    status_of,
    missing_skills,
    is_deleted,
    feedback_json,
    is_recommended,
  } = resultData;

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
      feedback_text: JSON.stringify(feedback_json),
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
};

module.exports.screenCandidate = async (candidate_id) => {
  try {
    if (!candidate_id) {
      throw new Error("Candidate ID is required.");
    }

    // Use the module's own exported function (this.getCandidateDetails)
    const candidateDetails = await this.getCandidateDetails(candidate_id);

    if (!candidateDetails) {
      throw new Error(
        `Failed to retrieve details for candidate ${candidate_id}`
      );
    }

    const token = generateToken();

    if (
      !candidateDetails.rcd_file_key ||
      candidateDetails.rcd_file_key === ""
    ) {
      console.log(`RCD file key is missing for candidate ${candidate_id}`);
      throw new Error("RCD file key is missing.");
    }

    // Get the candidate to extract job_id and user_id
    const candidate = await db.Candidates.findByPk(candidate_id);
    if (!candidate) {
      throw new Error(`Candidate not found with ID: ${candidate_id}`);
    }

    try {
      const aiResponse = await axios.post(
        `${process.env.AI_BACKEND_URL}/screen_candidates_2`,
        {
          jd: candidateDetails.jd,
          rcd_file_key: candidateDetails.rcd_file_key,
          candidate: candidateDetails.candidate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!aiResponse.data) {
        throw new Error("Empty response from AI service");
      }

      const payload = {
        candidate_id,
        job_id: candidate.job_id,
        user_id: candidate.user_id,
        match_score: aiResponse.data.combined_score,
        status_of: aiResponse.data.status === "success",
        missing_skills: {
          jd_match: aiResponse.data.feedback.jd_match || [],
          rcd_match: aiResponse.data.feedback.rcd_match || [],
          jd_mismatch: aiResponse.data.feedback.jd_mismatch || [],
          rcd_mismatch: aiResponse.data.feedback.rcd_mismatch || [],
          jd_skill_match: aiResponse.data.jd_skill_match || 0,
          rcd_skill_match: aiResponse.data.rcd_skill_match || 0,
          feedback: aiResponse.data.feedback.feedback || [],
          experience_match: aiResponse.data.feedback.experience_match || false,
          experience_info: aiResponse.data.feedback.experience_info || [],
          match_score: aiResponse.data.combined_score || 0,
          is_recommended:
            aiResponse.data.feedback.recommendation.toUpperCase() === "YES"
              ? "YES"
              : "NO",
        },
        is_deleted: false,
        is_recommended:
          aiResponse.data.feedback.recommendation.toUpperCase() === "YES"
            ? "YES"
            : "NO",
        feedback_json: aiResponse.data.feedback,
      };

      const existing = await db.ScreeningResults.findOne({
        where: { candidate_id },
      });

      if (existing) {
        await existing.update(payload);
      } else {
        await this.saveScreeningResult(payload);
      }

      await db.Candidates.update(
        {
          is_screened: true,
          is_recommended: payload.is_recommended,
          match_score: payload.match_score,
        },
        { where: { id: candidate_id } }
      );

      console.log(
        `AI Screening completed successfully for candidate ${candidate_id}`
      );
      return { success: true, message: "AI Screening completed successfully" };
    } catch (error) {
      console.error("Error in AI service communication:", error.message);
      throw new Error(`AI Screening failed: ${error.message}`);
    }
  } catch (error) {
    console.error(
      `Screening failed for candidate ${candidate_id}:`,
      error.message
    );
    throw error; // Preserve the original error
  }
};
