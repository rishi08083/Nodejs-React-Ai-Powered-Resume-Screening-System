const express = require("express");
const {
  recruiterAnalytics,
} = require("../controllers/analyticsController/recruiterAnalytics");
const {
  adminAnalytics,
} = require("../controllers/analyticsController/adminAnalytics");
const { authMiddleware } = require("../middlewares/authMiddleware");
const router = express.Router();

router.get("/recruiter-analytics", recruiterAnalytics);
router.get("/admin-analytics", authMiddleware, adminAnalytics);

module.exports = router;
