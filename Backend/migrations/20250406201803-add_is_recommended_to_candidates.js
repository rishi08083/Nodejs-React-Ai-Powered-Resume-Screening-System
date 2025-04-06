'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // First create the ENUM type for is_recommended
    await queryInterface.addColumn('candidates', 'is_recommended', {
      type: Sequelize.ENUM('YES', 'NO', 'NOT_SET'),
      defaultValue: 'NOT_SET',
      allowNull: false,
      after: 'resume_url' 
    });
  },

  async down(queryInterface, Sequelize) {
    // First remove the column
    await queryInterface.removeColumn('candidates', 'is_recommended');
    
    // Then drop the ENUM type (PostgreSQL syntax)
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_candidates_is_recommended";');
  }
};
