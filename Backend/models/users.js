"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    static associate(models) {
      Users.hasOne(models.Candidates, {
        foreignKey: "user_id",
        as: "candidates",
      });

      Users.hasMany(models.Jobs, { foreignKey: "user_id", as: "jobs" });

      Users.hasMany(models.UnparsedResume, {
        foreignKey: "user_id",
        as: "unparsed_resumes",
      });

      Users.hasMany(models.ParseResume, {
        foreignKey: "user_id",
        as: "parsed_resumes",
      });

      Users.hasMany(models.ScreeningResults, {
        foreignKey: "user_id",
        as: "screening_results",
      });
    }
  }

  Users.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      name: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      password_hash: { type: DataTypes.TEXT, allowNull: false },
      role: {
        type: DataTypes.ENUM("admin", "recruiter"),
        allowNull: false,
      },
      is_deleted: { type: DataTypes.BOOLEAN, defaultValue: false },
      token: { type: DataTypes.STRING, allowNull: true },
      token_expires: { type: DataTypes.DATE, allowNull: true },
      is_active: {
        type: DataTypes.ENUM("pending", "accepted", "rejected"), // Changed from BOOLEAN
        allowNull: false,
        defaultValue: "pending",
      },
      is_verified: { type: DataTypes.BOOLEAN, defaultValue: false, allowNull: false },
    },
    {
      sequelize,
      modelName: "Users",
      tableName: "users",
      timestamps: true,
      underscored: true,
      freezeTableName: true,
    }
  );

  return Users;
};
