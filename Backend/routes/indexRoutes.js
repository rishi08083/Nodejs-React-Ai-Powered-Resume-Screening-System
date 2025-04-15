const express = require("express");
const router = express.Router();

const authRoutes = require("../routes/authRoutes");
const uploadRoutes = require("../routes/uploadRoutes");
const homeRoutes = require("../routes/homeRoutes");
const userRoutes = require("../routes/userRoutes");
const rcdRoutes = require("./rcdRoutes.js");
const jobRoutes = require("./jobRoutes.js");
const candidateRoutes = require("./candidateRoutes");
const screeningRoutes = require("./screenRoutes");
const mailRecruiter = require("./mailRecruiter.js");
const analyticsRoutes = require("./analyticsRoutes.js");
const parseResumeRoutes = require("./parsedResumeRoutes.js");

router.get("/", homeRoutes);
router.use("/auth", authRoutes);
router.use("/upload", uploadRoutes);
router.use("/job", jobRoutes);
router.use("/user", userRoutes);
router.use("/rcd", rcdRoutes);
router.use("/candidates", candidateRoutes);
router.use("/screening", screeningRoutes);
router.use("/mail", mailRecruiter);
router.use("/analytics", analyticsRoutes);
router.use("/parsed-resume", parseResumeRoutes);

module.exports = router;
