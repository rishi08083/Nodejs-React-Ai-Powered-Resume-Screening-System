"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ScreeningResults extends Model {
    static associate(models) {
      // One-to-One: ScreeningResults → Candidates
      ScreeningResults.belongsTo(models.Candidates, {
        foreignKey: "candidate_id",
        as: "candidates",
      });

      // Many-to-One: ScreeningResults → Jobs
      ScreeningResults.belongsTo(models.Jobs, {
        foreignKey: "job_id",
        as: "jobs",
      });

      // Many-to-One: ScreeningResults → Users
      ScreeningResults.belongsTo(models.Users, {
        foreignKey: "user_id",
        as: "users",
      });
    }
  }

  ScreeningResults.init(
    {
      candidate_id: DataTypes.INTEGER,
      job_id: DataTypes.INTEGER,
      user_id: DataTypes.INTEGER,
      match_score: DataTypes.DECIMAL,
      status_of: DataTypes.BOOLEAN,
      missing_skills: DataTypes.JSONB,
      is_deleted: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "ScreeningResults",
      tableName: "screening_results",
      timestamps: true,
      underscored: true,
    }
  );

  return ScreeningResults;
};
