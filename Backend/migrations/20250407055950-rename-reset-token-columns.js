'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn("users", "reset_token", "token");
    await queryInterface.renameColumn("users", "reset_token_expires", "token_expires");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.renameColumn("users", "token", "reset_token");
    await queryInterface.renameColumn("users", "token_expires", "reset_token_expires");
  },
};
