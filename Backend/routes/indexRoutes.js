const express = require("express");
const router = express.Router();
const authRoutes = require("../routes/authRoutes");
const uploadRoutes = require("../routes/uploadRoutes");
const homeRoutes = require("../routes/homeRoutes");
const userRoutes = require("../routes/userRoutes");
const jobRoutes = require("./jobRoutes.js");

router.get("/", homeRoutes);
router.use("/auth", authRoutes);
router.use("/upload", uploadRoutes);
router.use("/job", jobRoutes);
router.use("/user", userRoutes);

module.exports = router;
