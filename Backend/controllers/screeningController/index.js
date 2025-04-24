const db = require("../../models"); // Load models
const axios = require("axios");
const {
  getCandidateDetails,
  saveScreeningResult,
} = require("../../utils/screenUtils");
const { generateToken } = require("../../utils/tokenGeneration"); // Token generator utility

const screenCandidate = async (req, res) => {
  try {
    const { candidate_id } = req.body;

    if (!candidate_id) {
      return res
        .status(400)
        .json({ status: "error", message: "Candidate ID is required." });
    }

    try {
      // console.log(`📝 Starting screening for candidate ${candidate_id}`);
      const candidateDetails = await getCandidateDetails(candidate_id);
      const token = generateToken();
      // console.log(candidateDetails)
      if (
        candidateDetails.rcd_file_key === null ||
        candidateDetails.rcd_file_key === undefined ||
        candidateDetails.rcd_file_key === ""
      ) {
        console.log(`❌ RCD file key is null for candidate ${candidate_id}`);
        return res
          .status(400)
          .json({ status: "error", message: "RCD file key is missing." });
      }

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

      const payload = {
        candidate_id,
        job_id: candidateDetails.jd.job_id,
        user_id: candidateDetails.user_id,
        match_score: aiResponse.data.combined_score, // Updated to match response
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
        await saveScreeningResult(payload);
      }

      await db.Candidates.update(
        {
          is_screened: true,
          is_recommended: payload.is_recommended,
          match_score: payload.match_score,
        },
        { where: { id: candidate_id } }
      );

      res.json({
        status: "success",
        message: "AI Screening completed and data updated successfully!",
      });
    } catch (error) {
      console.error("Error in AI Screening:", error);
      res
        .status(500)
        .json({ status: "error", message: "Internal Server Error" });
    }
  } catch (error) {
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};



const getFeedback = async (req, res) => {
  try {
    const { candidate_id } = req.params;
    // console.log("Fetching feedback for candidate_id:", candidate_id);

    const feedback = await getFeedbackByCandidateId(candidate_id);

    if (!feedback) {
      return res.status(404).json({
        status: "error",
        message: "No feedback found for this candidate.",
      });
    }
    res.json({
      status: "success",
      message: "Feedback retrieved successfully.",
      data: feedback,
    });
  } catch (error) {
    // console.error("Error fetching feedback:", error);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

// Fetch feedback by candidate_id
async function getFeedbackByCandidateId(candidate_id) {
  try {
    // Get candidate details
    const candidate = await db.Candidates.findByPk(candidate_id);
    if (!candidate) {
      throw new Error(`Candidate not found with id: ${candidate_id}`);
    }

    // list assotiaction method

    // Fetch feedback from Feedback table
    const ScreeningResults = await db.ScreeningResults.findOne({
      where: {
        candidate_id: candidate_id,
      },
    });
    // console.log(ScreeningResults, "ScreeningResults------------------");

    if (!ScreeningResults) {
      return null;
    }
    // console.log(candidate);
    const formattedFeedback = ScreeningResults; // Assuming feedback_json contains the required data
    const res = {
      feedback: formattedFeedback.missing_skills.feedback,
      candidate_id: candidate.id,
      rating: formattedFeedback.match_score,
      experience_match: formattedFeedback.missing_skills.experience_match ? true : false,
      recommendation: formattedFeedback.recommendation,
      feedback_summery: formattedFeedback.feedback,
      jd_mismatch: formattedFeedback.missing_skills.jd_mismatch,
      rcd_mismatch: formattedFeedback.missing_skills.rcd_mismatch,
      jd_match: formattedFeedback.missing_skills.jd_match,
      rcd_match: formattedFeedback.missing_skills.rcd_match,
      jd_match_score: formattedFeedback.missing_skills.jd_skill_match,
      rcd_match_score: formattedFeedback.missing_skills.rcd_skill_match,
      experience_info: formattedFeedback.missing_skills.experience_info,
      is_recommended: formattedFeedback.missing_skills.is_recommended,
    };
    // Format feedback for response
    return res;
  } catch (error) {
    console.error("Error fetching feedback:", error.message + error);
    throw new Error("Failed to fetch feedback.");
  }
}

module.exports = {
  screenCandidate,
  getFeedback,
};
