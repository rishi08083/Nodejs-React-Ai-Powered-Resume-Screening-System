const db = require("../../models");

module.exports.addCandidate = async (req, res) => {
  try {
    const {
      user_id,
      job_id,
      name,
      email,
      phone_number,
      match_score,
      parsed_resume_id,
      resume_url,
      is_screen_call_done,
      hiring_bull_status,
      status,
    } = req.body;

    const userExists = await db.Users.findByPk(user_id);
    if (!userExists) {
      return res.status(400).json({ message: "User not found!" });
    }

    const jobExists = await db.Jobs.findByPk(job_id);
    if (!jobExists) {
      return res.status(400).json({ message: "Job not found!" });
    }

    const candidate = await db.Candidates.create({
      user_id,
      job_id,
      name,
      email,
      phone_number,
      match_score,
      parsed_resume_id,
      resume_url,
      is_screen_call_done,
      hiring_bull_status,
      status,
      is_deleted: false,
    });

    return res.status(201).json({
      status: "success",
      message: "Candidate Created successfully",
      data: { candidate },
    });
  } catch (error) {
    console.error("Error adding candidate:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

module.exports.listCandidate = async (req, res) => {
  try {
    
    const { job_id } = req.params;
    const user = req.user;
    if (!job_id) {
      return res.status(400).json({
        status: "error",
        message: "Job ID is required",
      });
    }

    const candidates = await db.Candidates.findAll({
      where: { job_id: parseInt(job_id), is_deleted: false, user_id: user.id },
      order: [["createdAt", "DESC"]],
    });
    if (candidates.length === 0) {
      return res.status(200).json({
        status: "success",
        message: "No Candidates Found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Candidates Fetched successfully",
      data: { candidates },
    });
  } catch (error) {
    console.error("Error fetching candidates:", error);
    res.status(500).json({
      status: "error",
      message: "Candidate Fetching failed",
      error: { details: error.message },
    });
  }
};

module.exports.deleteCandidate = async (req, res) => {
  try {
    const { candidate_id } = req.params;

    if (!candidate_id) {
      return res.status(400).json({
        status: "error",
        message: "Candidate ID is required",
      });
    }

    const candidate = await db.Candidates.findByPk(candidate_id);

    await db.ParseResume.update(
      { is_deleted: true },
      { where: { candidate_id: candidate_id } }
    );

    if (!candidate) {
      return res.status(404).json({
        status: "error",
        message: "Candidate not found",
      });
    }

    await candidate.update({ is_deleted: true });

    res.status(200).json({
      status: "success",
      message: "Candidate deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting candidate:", error);
    res.status(500).json({
      status: "error",
      message: "Candidate deletion failed",
      error: { details: error.message },
    });
  }
};

module.exports.getRecommendedCandidates = async (req, res) => {
  try {
    const { job_id } = req.params;
    const user = req.user;
    if (!job_id) {
      return res.status(400).json({
        status: "error",
        message: "Job ID is required",
      });
    }

    const recommendedCandidates = await db.Candidates.findAll({
      where: {
        job_id: parseInt(job_id),
        is_deleted: false,
        match_score: {
          [db.Sequelize.Op.gt]: 40, // Greater than 40
        },
        user_id: user.id,
      },
      order: [["match_score", "DESC"]], // Order by match score in descending order
    });

    if (recommendedCandidates.length === 0) {
      return res.status(200).json({
        status: "success",
        message:
          "No recommended candidates found with match score greater than 40",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Recommended candidates fetched successfully",
      data: { recommendedCandidates },
    });
  } catch (error) {
    console.error("Error fetching recommended candidates:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch recommended candidates",
      error: { details: error.message },
    });
  }
};
