const db = require("../../models");

// Get parsed resume by candidate ID
exports.getParsedResumeByCandidateId = async (req, res) => {
  try {
    const parsedResume = await db.ParseResume.findOne({
      where: { candidate_id: req.params.candidateId },
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

