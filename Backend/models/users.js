"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    static associate(models) {
      // One-to-One: Users → Candidates
      Users.hasOne(models.Candidates, {
        foreignKey: "user_id",
        as: "candidate",
      });

      // One-to-Many: Users → Jobs
      Users.hasMany(models.Jobs, { foreignKey: "user_id", as: "jobs" });

      // One-to-Many: Users → UnparsedResume
      Users.hasMany(models.UnparsedResume, {
        foreignKey: "user_id",
        as: "unparsed_resumes",
      });

      // One-to-Many: Users → ParsedResume
      Users.hasMany(models.ParseResume, {
        foreignKey: "user_id",
        as: "parsed_resumes",
      });

      // One-to-Many: Users → ScreeningResults
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
      role: { type: DataTypes.ENUM("admin", "recruiter"), allowNull: false },
      is_deleted: { type: DataTypes.BOOLEAN, defaultValue: false },
      resetToken: { type: DataTypes.STRING, allowNull: true },
      resetTokenExpires: { type: DataTypes.DATE, allowNull: true },
    },
    {
      sequelize,
      modelName: "Users",
      tableName: "users",
      timestamps: true,
      underscored: true,
    }
  );

  return Users;
};
