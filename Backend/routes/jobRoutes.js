const express = require("express");
const router = express.Router();
const {
    fetchJobs,
    createJobs,
    getAllJobs,
    getJobById,
    updateJobs,
    deleteJobs,
} = require("../controllers/jobController");

router.post("/create", createJobs);
router.post("/fetch", fetchJobs);
router.get("/view", getAllJobs);
router.get("/view/:id", getJobById);
// router.put("/update/:id", updateJobs);
// router.delete("/delete/:id", deleteJobs);

module.exports = router;
