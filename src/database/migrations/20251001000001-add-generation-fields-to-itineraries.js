'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('itineraries', 'max_activities', {
      type: Sequelize.INTEGER,
      allowNull: true
    });

    await queryInterface.addColumn('itineraries', 'is_generated', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false
    });

    await queryInterface.addColumn('itineraries', 'generation_metadata', {
      type: Sequelize.JSON,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('itineraries', 'max_activities');
    await queryInterface.removeColumn('itineraries', 'is_generated');
    await queryInterface.removeColumn('itineraries', 'generation_metadata');
  }
};
