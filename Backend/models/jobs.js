"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Jobs extends Model {
    static associate(models) {
      // One-to-Many: Jobs → Candidates
      Jobs.hasMany(models.Candidates, {
        foreignKey: "job_id",
        as: "candidates",
      });

      // One-to-Many: Jobs → ScreeningResults
      Jobs.hasMany(models.ScreeningResults, {
        foreignKey: "job_id",
        as: "screening_results",
      });

      // Many-to-One: Jobs → Users
      Jobs.belongsTo(models.Users, { foreignKey: "user_id", as: "users" });
    }
  }

  Jobs.init(
    {
      title: DataTypes.STRING,
      description: DataTypes.TEXT,
      location: DataTypes.STRING,
      experience_required: DataTypes.INTEGER,
      user_id: DataTypes.INTEGER,
      is_deleted: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Jobs",
      tableName: "jobs",
      timestamps: true,
      underscored: true,
    }
  );

  return Jobs;
};
