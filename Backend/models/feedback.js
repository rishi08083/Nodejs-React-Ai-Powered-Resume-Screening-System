"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Feedback extends Model {
    static associate(models) {
      // Many-to-One: Feedback → Candidates
      Feedback.belongsTo(models.Candidates, {
        foreignKey: "candidate_id",
        as: "candidates",
      });
    }
  }

  Feedback.init(
    {
      candidate_id: DataTypes.INTEGER,
      feedback_text: DataTypes.TEXT,
      rating: DataTypes.INTEGER,
      given_by: DataTypes.STRING,
      is_deleted: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Feedback",
      tableName: "feedbacks",
      timestamps: true,
      underscored: true,
    }
  );

  return Feedback;
};
