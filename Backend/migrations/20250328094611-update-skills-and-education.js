"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("skills", "proficiency");
    await queryInterface.removeColumn("education", "field_of_study");
    await queryInterface.removeColumn("skills", "skill_name");
    await queryInterface.addColumn("skills", "skill_names", {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("skills", "proficiency", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("education", "field_of_study", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("skills", "skill_name");
    await queryInterface.removeColumn("skills", "skill_names");
  },
};
