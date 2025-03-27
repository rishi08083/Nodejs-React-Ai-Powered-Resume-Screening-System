"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("users", "is_active");

    // Add the new ENUM column
    await queryInterface.addColumn("users", "is_active", {
      type: Sequelize.ENUM("accepted", "rejected", "pending"),
      allowNull: false,
      defaultValue: "pending",
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert back to BOOLEAN in case of rollback
    await queryInterface.removeColumn("users", "is_active");

    await queryInterface.addColumn("users", "is_active", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },
};
