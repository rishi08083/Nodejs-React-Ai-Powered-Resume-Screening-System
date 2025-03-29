const express = require("express");
const router = express.Router();

const {authMiddleware} = require('../middlewares/authMiddleware');
const {
    fetchJobs,
    createJobs,
    getAllJobs,
    getJobById,
    updateJobs,
    deleteJobs,
} = require("../controllers/jobController");

router.post("/create", authMiddleware, createJobs);
router.post("/fetch", authMiddleware, fetchJobs);
router.get("/view", authMiddleware, getAllJobs);
router.get("/view/:id", getJobById);
// router.put("/update/:id", updateJobs);
// router.delete("/delete/:id", deleteJobs);

module.exports = router;
