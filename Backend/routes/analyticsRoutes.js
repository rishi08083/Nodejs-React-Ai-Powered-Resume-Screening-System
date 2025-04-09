const express = require("express");
const {
  recruiterAnalytics,
} = require("../controllers/analyticsController/recruiterAnalytics");
const {
  adminAnalytics,
} = require("../controllers/analyticsController/adminAnalytics");
const router = express.Router();

router.get("/recruiter-analytics", recruiterAnalytics);
router.get("/admin-analytics", adminAnalytics);

module.exports = router;
