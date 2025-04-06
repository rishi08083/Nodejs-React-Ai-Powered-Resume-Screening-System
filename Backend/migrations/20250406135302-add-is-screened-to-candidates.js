"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Check if the column exists before trying to add it
      const tableInfo = await queryInterface.describeTable("candidates");
      
      if (!tableInfo["is_screened"]) {
        console.log("Adding is_screened column to candidates table...");
        await queryInterface.addColumn("candidates", "is_screened", {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          allowNull: false,
        });
        console.log("Column is_screened successfully added!");
      } else {
        console.log("Column is_screened already exists, skipping...");
      }
    } catch (error) {
      console.error("Migration failed:", error);
      throw error;
    }
  },

  async down(queryInterface) {
    try {
      // Check if the column exists before trying to remove it
      const tableInfo = await queryInterface.describeTable("candidates");
      
      if (tableInfo["is_screened"]) {
        console.log("Removing is_screened column from candidates table...");
        await queryInterface.removeColumn("candidates", "is_screened");
        console.log("Column is_screened successfully removed!");
      } else {
        console.log("Column is_screened doesn't exist, skipping...");
      }
    } catch (error) {
      console.error("Migration rollback failed:", error);
      throw error;
    }
  },
};
