const db = require("../../models");

// Create jobs
exports.createJobs = async (req, res) => {
    try {
        const jobs = await db.db.Jobs.create(req.body);
        res.status(201).json({
            status: "success",
            message: "Job created successfully",
            data: { jobs },
        });
    } catch (error) {
        res.status(400).json({
            status: "error",
            message: "Failed to create job",
            error: { details: error.message },
        });
    }
};

// Get All jobs
exports.getAllJobs = async (req, res) => {
    try {
        const jobs = await db.Jobs.findAll();
        res.status(200).json({
            status: "success",
            message: "Jobs retrieved successfully",
            data: { jobs },
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Failed to retrieve jobs",
            error: { details: error.message },
        });
    }
};

// Get jobs by ID
exports.getJobById = async (req, res) => {
    try {
        const jobs = await db.Jobs.findByPk(req.params.id);
        if (!jobs) {
            return res.status(404).json({
                status: "error",
                message: "Job not found",
                error: { details: "No job found with the provided ID" },
            });
        }
        res.status(200).json({
            status: "success",
            message: "Job retrieved successfully",
            data: { jobs },
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Failed to retrieve job",
            error: { details: error.message },
        });
    }
};

// Update jobs
exports.updateJobs = async (req, res) => {
    try {
        const jobs = await db.Jobs.findByPk(req.params.id);
        if (!jobs) {
            return res.status(404).json({
                status: "error",
                message: "Job not found",
                error: { details: "No job found with the provided ID" },
            });
        }

        await jobs.update(req.body);
        res.status(200).json({
            status: "success",
            message: "Job updated successfully",
            data: { jobs },
        });
    } catch (error) {
        res.status(400).json({
            status: "error",
            message: "Failed to update job",
            error: { details: error.message },
        });
    }
};

// Delete jobs
exports.deleteJobs = async (req, res) => {
    try {
        const jobs = await db.Jobs.findByPk(req.params.id);
        if (!jobs) {
            return res.status(404).json({
                status: "error",
                message: "Job not found",
                error: { details: "No job found with the provided ID" },
            });
        }

        await jobs.destroy();
        res.status(200).json({
            status: "success",
            message: "Job deleted successfully",
            data: null,
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Failed to delete job",
            error: { details: error.message },
        });
    }
};
