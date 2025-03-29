'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add the column `is_role_clarity_upload1` to the `jobs` table
    await queryInterface.addColumn("jobs", "is_role_clarity_upload1", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false, // Default value for the new column
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove the column `is_role_clarity_upload1` from the `jobs` table
    await queryInterface.removeColumn("jobs", "is_role_clarity_upload1");
  }
};