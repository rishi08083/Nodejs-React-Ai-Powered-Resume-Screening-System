const express = require("express");
const router = express.Router();
const { getCandidateDetails, saveScreeningResult, getFeedbackByCandidateId } = require("../controllers/screeningController/index");
const axios = require("axios");
const db = require("../models");

// AI Screening Route
router.post("/screen_candidate", async (req, res) => {
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
        console.log("AI Screening Response:", JSON.stringify(aiResponse.data, null, 2));

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
});

// Fetch stored feedback by candidate_id
router.get("/get_feedback/:candidate_id", async (req, res) => {
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
});

module.exports = router;