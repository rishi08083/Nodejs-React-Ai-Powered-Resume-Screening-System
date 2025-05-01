const db = require("../../models");

exports.recruiterAnalytics = async (req, res) => {
  try {
    // Step 1: Find candidates of the current user
    const userCandidates = await db.Candidates.findAll({
      attributes: ["id", "name", "user_id"], // Add other fields if needed
      where: {
        is_deleted: false,
        user_id: req.user.id,
      },
      raw: true,
    });

    // Step 2: Extract candidate IDs
    const candidateIds = userCandidates.map((candidate) => candidate.id);

    if (candidateIds.length === 0) {
      return res.status(200).json({
        status: "success",
        data: {
          message: "No candidates found for the current user.",
          top_skills: [],
          num_of_candidates: 0,
        },
      });
    }

    // Step 3: Fetch analytics data in parallel
    const [
      numOfResumes,
      averageScreeningScore,
      candidateStatusCounts,
      dayWiseParseCount,
      candidateCountByJob,
      candidateSkills,
    ] = await Promise.all([
      // Count total resumes parsed
      db.Candidates.count({
        where: {
          is_deleted: false,
          user_id: req.user.id,
        },
      }),

      // Calculate average screening score
      db.Candidates.findOne({
        attributes: [
          [
            db.sequelize.fn("AVG", db.sequelize.col("match_score")),
            "average_screening_score",
          ],
        ],
        where: {
          is_deleted: false,
          user_id: req.user.id,
        },
        raw: true,
      }),

      // Count candidates by recommendation status
      db.Candidates.findAll({
        attributes: [
          "is_recommended",
          [db.sequelize.fn("COUNT", db.sequelize.col("user_id")), "count"],
        ],
        where: {
          is_deleted: false,
          user_id: req.user.id,
        },
        group: "is_recommended",
        raw: true,
      }),

      // Count resumes parsed by date
      db.ParseResume.findAll({
        attributes: [
          [db.sequelize.fn("DATE", db.sequelize.col("created_at")), "date"],
          [db.sequelize.fn("COUNT", db.sequelize.col("user_id")), "count"],
        ],
        where: {
          is_deleted: false,
          user_id: req.user.id,
        },
        group: [db.sequelize.fn("DATE", db.sequelize.col("created_at"))],
        order: [
          [db.sequelize.fn("DATE", db.sequelize.col("created_at")), "ASC"],
        ],
        raw: true,
      }),

      // Count candidates by job
      db.Candidates.findAll({
        attributes: [
          "job_id",
          [db.sequelize.col("jobs.title"), "job_title"],
          [
            db.sequelize.fn("COUNT", db.sequelize.col("Candidates.user_id")),
            "candidate_count",
          ],
        ],
        include: [
          {
            model: db.Jobs,
            attributes: [],
            required: true,
            as: "jobs",
          },
        ],
        where: {
          is_deleted: false,
          user_id: req.user.id,
        },
        group: ["Candidates.job_id", "jobs.title"],
        raw: true,
      }),

      // Find skills for the candidates
      db.Skills.findAll({
        attributes: [
          [db.sequelize.literal('unnest("skill_names")'), "skill_name"],
          [
            db.sequelize.fn(
              "COUNT",
              db.sequelize.fn("DISTINCT", db.sequelize.col("candidate_id"))
            ),
            "candidate_count",
          ],
        ],
        where: {
          candidate_id: {
            [db.Sequelize.Op.in]: candidateIds, // Using Op.in for array of candidate IDs
          },
        },
        raw: true,
        group: ["skill_name"],
        order: [[db.sequelize.literal("candidate_count"), "DESC"]],
        limit: 5, // Optional: limit to top skills
      }),
    ]);

    // Step 4: Process candidate status counts
    const statusCounts = candidateStatusCounts.reduce(
      (acc, { is_recommended, count }) => {
        acc[is_recommended] = count;
        return acc;
      },
      { NO: 0, YES: 0, NOT_SET: 0 }
    );

    // Step 5: Prepare the response
    const topSkills = candidateSkills.map((skill) => ({
      skill_name: skill.skill_name,
      candidate_count: skill.candidate_count,
    }));

    const fullResponse = {
      status: "success",
      data: {
        num_of_candidates: userCandidates.length,
        num_recommended_candidates: statusCounts.YES,
        average_screening_score:
          averageScreeningScore?.average_screening_score || 0,
        day_wise_parse_count: dayWiseParseCount,
        outcome: {
          num_of_candidates_on_hold: statusCounts.NOT_SET,
          num_of_candidates_rejected: statusCounts.NO,
          num_of_candidates_selected: statusCounts.YES,
        },
        candidate_count_by_job: candidateCountByJob.map((job) => ({
          job_id: job.job_id,
          job_title: job.job_title,
          candidate_count: job.candidate_count,
        })),
        top_skills: topSkills,
      },
    };
    res.status(200).json(fullResponse);
  } catch (error) {
    console.error("Error fetching recruiter analytics:", error);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
