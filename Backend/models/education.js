"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Education extends Model {
    static associate(models) {
      // Many-to-One: Education → Candidates
      Education.belongsTo(models.Candidates, {
        foreignKey: "candidate_id",
        as: "candidates",
      });
    }
  }

  Education.init(
    {
      candidate_id: DataTypes.INTEGER,
      institution_name: DataTypes.STRING,
      degree: DataTypes.STRING,
      start_date: DataTypes.DATE,
      end_date: DataTypes.DATE,
      is_deleted: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Education",
      tableName: "education",
      timestamps: true,
      underscored: true,
    }
  );

  return Education;
};
