const express = require("express");
const router = express.Router();

const authRoutes = require("../routes/authRoutes");
const uploadRoutes = require("../routes/uploadRoutes");
const homeRoutes = require("../routes/homeRoutes");
const userRoutes = require("../routes/userRoutes");
const rcdRoutes = require("./rcdRoutes.js");
const jobRoutes = require("./jobRoutes.js");
const candidateRoutes = require("./candidateRoutes");
const screeningRoutes = require("../controllers/screeningController");

router.get("/", homeRoutes);
router.use("/auth", authRoutes);
router.use("/upload", uploadRoutes);
router.use("/job", jobRoutes);
router.use("/user", userRoutes);
router.use("/rcd", rcdRoutes);
router.use("/candidates", candidateRoutes);
router.use("/screening", screeningRoutes);

module.exports = router;
