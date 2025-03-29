"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class UnparsedResume extends Model {
    static associate(models) {
      // Many-to-One: UnparsedResume → Users
      UnparsedResume.belongsTo(models.Users, {
        foreignKey: "user_id",
        as: "users",
      });
    }
  }

  UnparsedResume.init(
    {
      user_id: DataTypes.INTEGER,
      resume_url: DataTypes.STRING,
      status: DataTypes.STRING,
      is_deleted: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "UnparsedResume",
      tableName: "unparsed_resumes",
      timestamps: true,
      underscored: true,
    }
  );

  return UnparsedResume;
};
