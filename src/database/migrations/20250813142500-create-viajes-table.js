'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('trips', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      destination: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      start_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      end_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      travelers_count: {
        type: Sequelize.SMALLINT,
        allowNull: false,
        defaultValue: 1,
      },
      total_budget: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      cover_image: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('draft', 'planned', 'active', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'draft',
      },
      location: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });
  }
};