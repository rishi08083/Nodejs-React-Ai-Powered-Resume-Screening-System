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
    let { resume_obj } = req.body;

    resume_obj = JSON.parse(resume_obj);

    // Find the candidate
    const candidate = await db.Candidates.findOne({
      where: { id: candidateId },
      include: [
        { model: db.ParseResume, as: "parsed_resume" },
        { model: db.Skills, as: "skills" },
        { model: db.Experience, as: "experiences" },
        { model: db.Education, as: "education" },
      ],
      transaction,
    });

    if (!candidate) {
      await transaction.rollback();
      return res.status(404).json({
        status: "error",
        message: "Candidate not found",
      });
    }

    // Update or create parsed resume
    if (candidate.parsed_resume) {
      await candidate.parsed_resume.update(
        { resume_obj: resume_obj },
        { transaction }
      );
    } else {
      await candidate.createParsed_resume(
        {
          resume_obj: resume_obj,
          is_deleted: false,
        },
        { transaction }
      );
    }

    // Update candidate's basic info
    await candidate.update(
      {
        name: resume_obj.name || candidate.name,
        email: resume_obj.email || candidate.email,
        phone_number: resume_obj.phone || candidate.phone_number,
      },
      { transaction }
    );

    // Update skills
    if (resume_obj.skills && Array.isArray(resume_obj.skills)) {
      // Delete existing skills
      await db.Skills.destroy({
        where: { candidate_id: candidateId },
        transaction,
      });

      // Create new skills
      for (const skill of resume_obj.skills) {
        await candidate.createSkill(
          {
            skill_name: skill,
          },
          { transaction }
        );
      }
    }

    // Update experience
    if (resume_obj.experience && Array.isArray(resume_obj.experience)) {
      // Delete existing experiences
      await db.Experience.destroy({
        where: { candidate_id: candidateId },
        transaction,
      });

      // Create new experiences
      for (const exp of resume_obj.experience) {
        const startDate = exp.start_date ? new Date(exp.start_date) : null;
        const endDate = exp.end_date ? new Date(exp.end_date) : null;
        const isValidDate = (date) => date instanceof Date && !isNaN(date);

        await candidate.createExperience(
          {
            company: exp.company || "Unknown Company",
            job_title: exp.job_title || "Unknown Job Title",
            start_date: isValidDate(startDate) ? startDate : null,
            end_date: isValidDate(endDate) ? endDate : null,
          },
          { transaction }
        );
      }
    }

    // Update education
    if (resume_obj.education && Array.isArray(resume_obj.education)) {
      // Delete existing education records
      await db.Education.destroy({
        where: { candidate_id: candidateId },
        transaction,
      });

      // Create new education records
      for (const edu of resume_obj.education) {
        const startDate = edu.start_date ? new Date(edu.start_date) : null;
        const endDate = edu.end_date ? new Date(edu.end_date) : null;
        const isValidDate = (date) => date instanceof Date && !isNaN(date);

        await candidate.createEducation(
          {
            institution: edu.College || "Unknown Institution",
            degree: edu.Degree || "Unknown Degree",
            start_date: isValidDate(startDate) ? startDate : null,
            end_date: isValidDate(endDate) ? endDate : null,
          },
          { transaction }
        );
      }
    }

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
