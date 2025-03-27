const express = require("express");
const router = express.Router();
const { getUserDetails } = require("../controllers/authControllers/userController");
const auth = require("../middlewares/authMiddleware");

router.post("/getuserdetails", auth.authMiddleware, getUserDetails);

module.exports = router;
