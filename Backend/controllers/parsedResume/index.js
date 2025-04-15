const db = require("../../models");

// Get parsed resume by candidate ID
exports.getParsedResumeByCandidateId = async (req, res) => {
    try {
        const parsedResume = await db.ParsedResumes.findOne({
            where: { candidateId: req.params.candidateId },
        });

        if (!parsedResume) {
            return res.status(404).json({
                status: "error",
                message: "Parsed resume not found for the given candidate ID",
            });
        }

        res.status(200).json({
            status: "success",
            message: "Parsed resume retrieved successfully",
            data: parsedResume,
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Failed to retrieve parsed resume",
            error: { details: error.message },
        });
    }
};

// Get all parsed resumes
exports.getAllParsedResumes = async (req, res) => {
    try {
        const parsedResumes = await db.ParsedResumes.findAll({
            attributes: ["id", "name", "email", "phone", "skills", "experience"],
        });

        res.status(200).json({
            status: "success",
            message: "Parsed resumes retrieved successfully",
            data: parsedResumes,
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Failed to retrieve parsed resumes",
            error: { details: error.message },
        });
    }
};