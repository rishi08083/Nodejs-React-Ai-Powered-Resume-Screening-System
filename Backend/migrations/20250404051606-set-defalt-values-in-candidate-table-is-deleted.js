module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('candidates', 'is_deleted', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: true // or false, depending on your requirements
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('candidates', 'is_deleted', {
      type: Sequelize.BOOLEAN,
      defaultValue: null,
      allowNull: true
    });
  }
};