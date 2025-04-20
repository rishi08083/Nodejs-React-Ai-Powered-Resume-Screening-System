const express = require("express");
const router = express.Router();
const {authMiddleware} = require("../middlewares/authMiddleware");

const {
  getParsedResumeByCandidateId,
  updateParsedResume,
} = require("../controllers/parsedResume");

router.get(
  "/:candidateId",
  authMiddleware,
  getParsedResumeByCandidateId
);
router.put(
  "/update/:candidateId",
  authMiddleware,
  updateParsedResume
);

module.exports = router;
