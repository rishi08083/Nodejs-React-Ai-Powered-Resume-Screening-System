const express = require("express");
const router = express.Router();
const authRoutes = require("../routes/authRoutes");
const homeRoutes = require("../routes/homeRoutes");

router.get("/", homeRoutes);
router.use("/auth", authRoutes);

module.exports = router;
