const express = require("express");
const router = express.Router();
const { screenCandidate, getFeedback } = require("../controllers/screeningController/index");

// AI Screening Route
router.post("/screen_candidate", screenCandidate);

// Fetch stored feedback by candidate_id
router.get("/get_feedback/:candidate_id", getFeedback);

module.exports = router;