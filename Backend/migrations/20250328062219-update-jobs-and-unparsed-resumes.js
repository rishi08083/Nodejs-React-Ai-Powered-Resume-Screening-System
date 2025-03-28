"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove user_id from jobs
    await queryInterface.removeColumn("jobs", "user_id");

    // Change experience_required type from INTEGER to STRING
    await queryInterface.changeColumn("jobs", "experience_required", {
      type: Sequelize.STRING,
      allowNull: true, // Adjust based on your requirements
    });

    // Add job_id to unparsed_resumes table
    await queryInterface.addColumn("unparsed_resumes", "job_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "jobs", // Referencing the jobs table
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  async down(queryInterface, Sequelize) {
    // Re-add user_id to jobs (in case of rollback)
    await queryInterface.addColumn("jobs", "user_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    // Revert experience_required back to INTEGER
    await queryInterface.changeColumn("jobs", "experience_required", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    // Remove job_id from unparsed_resumes (in case of rollback)
    await queryInterface.removeColumn("unparsed_resumes", "job_id");
  },
};
