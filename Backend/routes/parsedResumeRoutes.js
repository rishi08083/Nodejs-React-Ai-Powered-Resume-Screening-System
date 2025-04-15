const express = require("express");
const auth = require("../middlewares/authMiddleware");

const { getParsedResumeByCandidateId } = require("../controllers/parsedResume");

const router = express.Router();

router.get("/:candidateId", auth.authMiddleware, getParsedResumeByCandidateId);

module.exports = router;
