'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nombre: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      correo: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      contrasena: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      pais: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      ciudad: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      verificado: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      activo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // Agregar índices
    await queryInterface.addIndex('users', ['correo'], {
      unique: true,
      name: 'users_correo_unique'
    });

    await queryInterface.addIndex('users', ['activo'], {
      name: 'users_activo_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  }
};
