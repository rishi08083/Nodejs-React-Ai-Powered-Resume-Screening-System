const db = require("../../models");

// Create jobs
exports.createJobs = async (req, res) => {
    try {
        const jobs = await db.db.Jobs.create(req.body);
        res.status(201).json(jobs);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get All jobs
exports.getAllJobs = async (req, res) => {
    try {
        const jobs = await db.Jobs.findAll();
        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get jobs by ID
exports.getJobById = async (req, res) => {
    try {
        const jobs = await db.Jobs.findByPk(req.params.id);
        if (!jobs) return res.status(404).json({ error: "jobs not found" });
        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update jobs
exports.updateJobs = async (req, res) => {
    try {
        const jobs = await db.Jobs.findByPk(req.params.id);
        if (!jobs) return res.status(404).json({ error: "jobs not found" });

        await db.Jobs.update(req.body);
        res.status(200).json(jobs);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete jobs
exports.deleteJobs = async (req, res) => {
    try {
        const jobs = await db.Jobs.findByPk(req.params.id);
        if (!jobs) return res.status(404).json({ error: "jobs not found" });

        await db.Jobs.destroy();
        res.status(200).json({ message: "jobs deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
