const express = require("express");
const router = express.Router();
const { getUserDetails } = require("../controllers/authControllers/userController");
const { 
  getProfileDetails, 
  updateProfile, 
  changePassword 
} = require("../controllers/authControllers/profileController");
const auth = require("../middlewares/authMiddleware");

// Existing routes
router.post("/getuserdetails", auth.authMiddleware, getUserDetails);

// New profile routes
router.get("/profile", auth.authMiddleware, getProfileDetails);
router.put("/update-profile", auth.authMiddleware, updateProfile);
router.put("/change-password", auth.authMiddleware, changePassword);

module.exports = router;