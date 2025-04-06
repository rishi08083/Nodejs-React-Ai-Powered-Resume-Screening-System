"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable("candidates");
    if (!tableInfo["is_screened"]) {
      await queryInterface.addColumn("candidates", "is_screened", {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("candidates", "is_screened");
  },
};
