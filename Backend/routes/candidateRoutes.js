const express = require("express");
const { addCandidate,listCandidate } = require("../controllers/candidateController");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/add", authMiddleware.authMiddleware, addCandidate);
router.get("/list", authMiddleware.authMiddleware, listCandidate);

module.exports = router;
