const express = require("express");
const {
  recruiterAnalytics,
} = require("../controllers/analyticsController/recruiterAnalytics");
const {
  adminAnalytics,
} = require("../controllers/analyticsController/adminAnalytics");

const { authMiddleware } = require("../middlewares/authMiddleware");
const {
  checkCache,
  checkRecruiterCache,
} = require("../middlewares/cacheMiddleWare");
const router = express.Router();

router.get(
  "/recruiter-analytics",
  authMiddleware,
  checkRecruiterCache,
  recruiterAnalytics
);

router.get("/admin-analytics", authMiddleware, checkCache, adminAnalytics);

module.exports = router;
