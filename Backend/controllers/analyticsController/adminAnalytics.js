const db = require("../../models");
const { cache } = require("../../middlewares/cacheMiddleWare");
exports.adminAnalytics = async (req, res) => {
  try {
    const [
      numOfResumes,
      numOfCandidates,
      averageScreeningScore,
      candidateStatusCounts,
      dayWiseParseCount,
      candidateCountByJob,
      candidateCountBySkill,
    ] = await Promise.all([
      db.ParseResume.count({
        where: {
          is_deleted: false,
        },
      }),
      db.Candidates.count({
        where: {
          is_deleted: false,
        },
      }),
      db.Candidates.findOne({
        attributes: [
          [
            db.sequelize.fn("AVG", db.sequelize.col("match_score")),
            "average_screening_score",
          ],
        ],
        where: {
          is_deleted: false,
        },
        raw: true,
      }),
      db.Candidates.findAll({
        attributes: [
          "is_recommended",
          [db.sequelize.fn("COUNT", db.sequelize.col("user_id")), "count"],
        ],
        where: {
          is_deleted: false,
        },
        group: "is_recommended",
        raw: true,
      }),
      db.ParseResume.findAll({
        attributes: [
          [db.sequelize.fn("DATE", db.sequelize.col("created_at")), "date"],
          [db.sequelize.fn("COUNT", db.sequelize.col("user_id")), "count"],
        ],
        where: {
          is_deleted: false,
        },
        group: [db.sequelize.fn("DATE", db.sequelize.col("created_at"))],
        order: [
          [db.sequelize.fn("DATE", db.sequelize.col("created_at")), "ASC"],
        ],
        raw: true,
      }),
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
        },
        group: ["Candidates.job_id", "jobs.title"],
        raw: true,
      }),
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

        raw: true,
        group: ["skill_name"],
        order: [[db.sequelize.literal("candidate_count"), "DESC"]],
      }),
    ]);

    const statusCounts = candidateStatusCounts.reduce(
      (acc, { is_recommended, count }) => {
        acc[is_recommended] = count;
        return acc;
      },
      { NO: 0, YES: 0, NOT_SET: 0 }
    );
    let fullResponse = {
      status: "success",
      data: {
        num_of_resumes: numOfResumes,
        num_of_candidates: numOfCandidates,
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
        candidate_count_by_skill: candidateCountBySkill.filter((skillMap) => {
          return skillMap.skill_name.length < 10;
        }),
      },
    };
    try {
      cache.set("adminAnalytics", fullResponse);
    } catch (error) {
      console.log("Cache settings failed ");
    }

    res.status(200).json(fullResponse);
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
