const express = require("express");
const {
  addCandidate,
  listCandidate,
  deleteCandidate,
  getRecommendedCandidates,
} = require("../controllers/candidateController");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/add", authMiddleware.authMiddleware, addCandidate);
router.get("/list/:job_id", authMiddleware.authMiddleware, listCandidate);
router.get(
  "/recommended/:job_id",
  authMiddleware.authMiddleware,
  getRecommendedCandidates
);
router.delete(
  "/delete/:candidate_id",
  authMiddleware.authMiddleware,
  deleteCandidate
);
module.exports = router;
