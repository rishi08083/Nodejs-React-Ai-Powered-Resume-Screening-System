'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Rename columns
    await queryInterface.renameColumn("users", "reset_token", "token");
    await queryInterface.renameColumn("users", "reset_token_expires", "token_expires");

    // Add new column
    await queryInterface.addColumn("users", "is_verified", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert column names
    await queryInterface.renameColumn("users", "token", "reset_token");
    await queryInterface.renameColumn("users", "token_expires", "reset_token_expires");

    // Remove the new column
    await queryInterface.removeColumn("users", "is_verified");
  },
};