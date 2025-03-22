const express = require("express");
const router = express.Router();
const authRoutes = require("../routes/authRoutes");
const uploadRoutes = require("../routes/uploadRoutes");
const homeRoutes = require("../routes/homeRoutes");
const createJobRoutes = require("./createJobRoutes.js");

router.get("/", homeRoutes);
router.use("/auth", authRoutes);
router.use("/upload", uploadRoutes);
router.use("/create-job", createJobRoutes);

module.exports = router;
