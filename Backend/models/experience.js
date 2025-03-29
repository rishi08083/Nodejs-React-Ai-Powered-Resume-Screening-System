"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Experience extends Model {
    static associate(models) {
      // Many-to-One: Experience → Candidates
      Experience.belongsTo(models.Candidates, {
        foreignKey: "candidate_id",
        as: "candidates",
      });
    }
  }

  Experience.init(
    {
      candidate_id: DataTypes.INTEGER,
      company_names: DataTypes.STRING, // Changed from company_name
      job_titles: DataTypes.STRING, // Changed from role
      start_date: DataTypes.DATE,
      end_date: DataTypes.DATE,
      is_deleted: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Experience",
      tableName: "experiences",
      timestamps: true,
      underscored: true,
    }
  );

  return Experience;
};
