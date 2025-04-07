"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Candidates extends Model {
    static associate(models) {
      // One-to-One: Candidates → Users
      Candidates.belongsTo(models.Users, {
        foreignKey: "user_id",
        as: "users",
      });

      // Many-to-One: Candidates → Jobs
      Candidates.belongsTo(models.Jobs, { foreignKey: "job_id", as: "jobs" });

      // One-to-Many: Candidates → Skills
      Candidates.hasMany(models.Skills, {
        foreignKey: "candidate_id",
        as: "skills",
      });

      // One-to-One: Candidates → ScreeningResults
      Candidates.hasOne(models.ScreeningResults, {
        foreignKey: "candidate_id",
        as: "screening_results",
      });

      // One-to-Many: Candidates → Feedback
      Candidates.hasMany(models.Feedback, {
        foreignKey: "candidate_id",
        as: "feedbacks",
      });

      // One-to-Many: Candidates → Experience
      Candidates.hasMany(models.Experience, {
        foreignKey: "candidate_id",
        as: "experiences",
      });

      // One-to-Many: Candidates → Education
      Candidates.hasMany(models.Education, {
        foreignKey: "candidate_id",
        as: "education",
      });

      // One-to-One: Candidates → ParsedResume
      Candidates.hasOne(models.ParseResume, {
        foreignKey: "candidate_id",
        as: "parsed_resume",
      });
    }
  }

  Candidates.init(
    {
      user_id: DataTypes.INTEGER,
      job_id: DataTypes.INTEGER,
      name: DataTypes.STRING,
      email: DataTypes.STRING,
      phone_number: DataTypes.STRING,
      match_score: DataTypes.INTEGER,
      parsed_resume_id: DataTypes.INTEGER,
      resume_url: DataTypes.STRING,
      is_recommended: {
        type: DataTypes.ENUM("YES", "NO", "NOT_SET"),
        defaultValue: "NOT_SET",
        allowNull: false
      },
      is_screen_call_done: DataTypes.BOOLEAN,
      hiring_bull_status: DataTypes.BOOLEAN,
      status: DataTypes.STRING,
      is_screened: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      is_deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "Candidates",
      tableName: "candidates",
      timestamps: true,
      underscored: true,
    }
  );
  return Candidates;
};