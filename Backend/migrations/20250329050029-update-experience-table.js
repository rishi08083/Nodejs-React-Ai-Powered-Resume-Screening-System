'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn("experiences", "company_name");
    await queryInterface.addColumn("experiences", "company_names", {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: true,
    });
    await queryInterface.removeColumn("experiences", "role");
    await queryInterface.addColumn("experiences", "job_titles", {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.addColumn("experiences", "company_name");
    await queryInterface.removeColumn("experiences", "company_names");
    await queryInterface.addColumn("experiences", "role");
    await queryInterface.removeColumn("experiences", "job_titles");
  }
  
};
