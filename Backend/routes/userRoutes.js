const express = require("express");
const router = express.Router();
const { getUserDetails } = require("../controllers/userController");
router.post("/getuserdetails", getUserDetails);

module.exports = router;
