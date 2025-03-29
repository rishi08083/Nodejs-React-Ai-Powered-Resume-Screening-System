"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("jobs", "job_type", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("jobs", "openings", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn("jobs", "company_name", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("jobs", "skills_required", {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn("jobs", "contact_info", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("jobs", "salary_range", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("jobs", "application_deadline", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn("jobs", "is_rcd_uploaded", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.addColumn("jobs", "rcd_url", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("jobs", "job_type");
    await queryInterface.removeColumn("jobs", "openings");
    await queryInterface.removeColumn("jobs", "company_name");
    await queryInterface.removeColumn("jobs", "skills_required");
    await queryInterface.removeColumn("jobs", "contact_info");
    await queryInterface.removeColumn("jobs", "salary_range");
    await queryInterface.removeColumn("jobs", "application_deadline");
    await queryInterface.removeColumn("jobs", "is_rcd_uploaded");
    await queryInterface.removeColumn("jobs", "rcd_url");
  },
};
