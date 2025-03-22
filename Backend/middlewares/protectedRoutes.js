const express = require("express");
const { authMiddleware } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");

const router = express.Router();

router.get("/dashboard", authMiddleware, (req, res) => {
  res.json({ message: "Welcome to Dashboard" });
});

// HR Admins and Recruiters can create jobs
router.post("/create-job", authMiddleware, authorizeRoles(["HR Admin", "Recruiter"]), (req, res) => {
  res.json({ message: "Job Created Successfully" });
});

module.exports = router;
