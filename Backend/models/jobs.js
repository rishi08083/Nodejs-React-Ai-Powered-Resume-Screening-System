"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Jobs extends Model {
    static associate(models) {
      Jobs.hasMany(models.Candidates, {
        foreignKey: "job_id",
        as: "candidates",
      });

      Jobs.hasMany(models.ScreeningResults, {
        foreignKey: "job_id",
        as: "screening_results",
      });
    }
  }

  Jobs.init(
    {
      title: DataTypes.STRING,
      description: DataTypes.TEXT,
      location: DataTypes.STRING,
      experience_required: DataTypes.STRING,
      job_type: DataTypes.STRING,
      openings: DataTypes.INTEGER,
      company_name: DataTypes.STRING,
      skills_required: DataTypes.TEXT,
      contact_info: DataTypes.STRING,
      salary_range: DataTypes.STRING,
      application_deadline: DataTypes.DATE,
      is_rcd_uploaded: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      rcd_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
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
