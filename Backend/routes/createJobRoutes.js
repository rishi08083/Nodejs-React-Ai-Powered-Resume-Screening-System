const express = require("express");
const router = express.Router();
const createJobController = require("../controllers/createJobController");

router.post("/", createJobController.createJobs);

module.exports = router;
