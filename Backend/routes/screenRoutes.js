const express = require("express");
const router = express.Router();
const { getCandidateDetails } = require("../services/candidateService");
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
            candidate: candidateDetails.candidate
        };

        console.log("Prepared Request for AI Screening:", JSON.stringify(requestBody, null, 2));

        // Uncomment to make API call
        // const response = await axios.post(`${process.env.AI_BACKEND_URL}/api/screen_candidates_2`, requestBody);
        // res.json(response.data);

        // Return response to client for now
        res.json({ success: true, candidateDetails });
    } catch (error) {
        console.error("Error in AI Screening:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
