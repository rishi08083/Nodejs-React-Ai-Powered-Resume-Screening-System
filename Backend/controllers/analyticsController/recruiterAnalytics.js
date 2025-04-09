const db = require("../../models");
const { Op } = require("sequelize");

exports.recruiterAnalytics = async (req, res) => {
  try {
    const numOfResumes = await db.UnparsedResume.count();
    res.json({ status: "success", numOfResumes });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
