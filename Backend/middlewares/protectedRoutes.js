const express = require("express");
const { authMiddleware } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");

const router = express.Router();

router.get("/dashboard", authMiddleware, (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Welcome to Dashboard",
    data: {}
  });
});

// HR Admins and Recruiters can create jobs
router.post("/create-job", authMiddleware, authorizeRoles(["HR Admin", "Recruiter"]), (req, res) => {
  try {
    // Assuming job creation logic here
    res.status(200).json({
      status: "success",
      message: "Job Created Successfully",
      data: {}
    });
  } catch (err) {
    res.status(400).json({
      status: "error",
      message: err.message,
      error: { details: err.message }
    });
  }
});

module.exports = router;
