const express = require("express");
const router = express.Router();
const createJobController = require("../controllers/createJobController.js");

router.post("/", createJobController.createJobs);

module.exports = router;
