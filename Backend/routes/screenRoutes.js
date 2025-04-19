const express = require("express");
const router = express.Router();
const {
  screenCandidate,
  getFeedback,
} = require("../controllers/screeningController/index");
const { authMiddleware } = require("../middlewares/authMiddleware");

// AI Screening Route

// not used
router.post("/screen_candidate", authMiddleware, screenCandidate);

// Fetch stored feedback by candidate_id
router.get("/get_feedback/:candidate_id", authMiddleware, getFeedback);

module.exports = router;
