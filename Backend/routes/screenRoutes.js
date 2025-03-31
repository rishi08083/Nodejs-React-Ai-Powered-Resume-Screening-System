const express = require("express");
const router = express.Router();
const { getCandidateDetails, saveScreeningResult, getFeedbackByCandidateId } = require("../controllers/screeningController/index");
const axios = require("axios");

// AI Screening Route
router.post("/screen_candidate", async (req, res) => {
    try {
        const { candidate_id } = req.body;

        console.log("Received Request:", req.body);
        if (!candidate_id) {
            return res.status(400).json({ error: "Missing candidate_id" });
        }

        // Fetch candidate details
        const candidateDetails = await getCandidateDetails(candidate_id);
        if (!candidateDetails) {
            return res.status(404).json({ error: "Candidate not found" });
        }

        console.log("Candidate Details Response:", JSON.stringify(candidateDetails, null, 2));

        // Prepare request for AI screening
        const requestBody = {
            jd: candidateDetails.jd,
            rcd_file_key: candidateDetails.rcd_file_key,
            candidate: candidateDetails.candidate,
        };

        console.log("Prepared Request for AI Screening:", JSON.stringify(requestBody, null, 2));

        // Call FastAPI to get AI screening results
        const aiResponse = await axios.post(`${process.env.AI_SERVER_URL}/api/screen_candidates_2`, requestBody);

        console.log("AI Screening Response:", JSON.stringify(aiResponse.data, null, 2));

        // Save AI response to DB
        await saveScreeningResult({
            candidate_id,
            job_id: candidateDetails.jd.job_id,
            user_id: candidateDetails.user_id,
            match_score: aiResponse.data.Combined_Score,
            status_of: aiResponse.data.status === "success",
            missing_skills: aiResponse.data.missing_skills || [],
            is_deleted: false,
            feedback_json: aiResponse.data, // Save full JSON in feedback
        });

        res.json({ success: true, message: "AI Screening completed and data saved successfully!" });
    } catch (error) {
        console.error("Error in AI Screening:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


// Fetch stored feedback by candidate_id
router.get("/get_feedback/:candidate_id", async (req, res) => {
    try {
        const { candidate_id } = req.params;

        console.log("Fetching feedback for candidate_id:", candidate_id);

        // Call controller function to fetch feedback
        const feedback = await getFeedbackByCandidateId(candidate_id);

        if (!feedback) {
            return res.status(404).json({ error: "No feedback found for this candidate." });
        }

        res.json({ success: true, feedback });
    } catch (error) {
        console.error("Error fetching feedback:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
