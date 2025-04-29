const { where } = require("sequelize");
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

exports.updateParsedResume = async (req, res) => {
  console.log("req.body", req.body);
  const transaction = await db.sequelize.transaction();

  try {
    const { candidateId } = req.params;
    let { email, phone, name } = req.body;

    await db.Candidates.update(
      { email, phone, name },
      { where: { id: candidateId }, transaction }
    );

    await transaction.commit();
    res.status(200).json({
      status: "success",
      message: "Resume data updated successfully",
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error updating resume data:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update resume data",
      error: error.message,
    });
  }
};
