"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ParseResume extends Model {
    static associate(models) {
      // One-to-One: ParseResume → Candidates
      ParseResume.belongsTo(models.Candidates, {
        foreignKey: "candidate_id",
        as: "candidates",
      });

      // One-to-Many: ParseResume → Users
      ParseResume.belongsTo(models.Users, {
        foreignKey: "user_id",
        as: "users",
      });
    }
  }

  ParseResume.init(
    {
      candidate_id: DataTypes.INTEGER,
      user_id: DataTypes.INTEGER,
      resume_obj: DataTypes.JSON,
      is_deleted: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "ParseResume",
      tableName: "parse_resumes",
      timestamps: true,
      underscored: true,
    }
  );

  return ParseResume;
};
