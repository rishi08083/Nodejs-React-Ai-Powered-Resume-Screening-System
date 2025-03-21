const express = require("express");
const router = express.Router();
const authRoutes = require("../routes/authRoutes");
const homeRoutes = require("../routes/homeRoutes");
const userRoutes = require("../routes/userRoutes");

router.get("/", homeRoutes);
router.use("/auth", authRoutes);
router.use("/user", userRoutes);

module.exports = router;
