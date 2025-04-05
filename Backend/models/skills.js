"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Skills extends Model {
    static associate(models) {
      // Many-to-One: Skills → Candidates
      Skills.belongsTo(models.Candidates, {
        foreignKey: "candidate_id",
        as: "candidates",
      });
    }
  }

  Skills.init(
    {
      candidate_id: DataTypes.INTEGER,
      skill_names: DataTypes.ARRAY(DataTypes.STRING(10000)), // Changed from skill_name
      is_deleted: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Skills",
      tableName: "skills",
      timestamps: true,
      underscored: true,
    }
  );

  return Skills;
};
