"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Step 1: Add a new column with JSONB type
      await queryInterface.addColumn(
        "skills",
        "temp_skill_names",
        {
          type: Sequelize.JSONB,
          allowNull: false,
          defaultValue: [],
        },
        { transaction }
      );

      // Step 2: Copy existing data by converting VARCHAR[] to JSONB
      await queryInterface.sequelize.query(
        `UPDATE skills SET temp_skill_names = to_jsonb(skill_names);`,
        { transaction }
      );

      // Step 3: Remove the old column
      await queryInterface.removeColumn("skills", "skill_names", { transaction });

      // Step 4: Rename temp column to skill_names
      await queryInterface.renameColumn("skills", "temp_skill_names", "skill_names", { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Step 1: Add back the original column
      await queryInterface.addColumn(
        "skills",
        "temp_skill_names",
        {
          type: Sequelize.ARRAY(Sequelize.STRING),
          allowNull: true,
        },
        { transaction }
      );

      // Step 2: Convert JSONB data back to an array
      await queryInterface.sequelize.query(
        `UPDATE skills SET temp_skill_names = array(select jsonb_array_elements_text(skill_names));`,
        { transaction }
      );

      // Step 3: Remove JSONB column
      await queryInterface.removeColumn("skills", "skill_names", { transaction });

      // Step 4: Rename temp column back to skill_names
      await queryInterface.renameColumn("skills", "temp_skill_names", "skill_names", { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
