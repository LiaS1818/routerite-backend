'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
        comment: 'Primary key - UUID for user identification',
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'User full name',
      },
      email: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
        comment: 'User email address - must be unique',
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'User password (hashed)',
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
        comment: 'Whether the user account is active',
      },
      is_email_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        comment: 'Whether the user email has been verified',
      },
      is_premium: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        comment: 'Whether the user has premium subscription',
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
    });

    // Crear índices para optimizar consultas
    await queryInterface.addIndex('users', ['email'], {
      name: 'idx_users_email_unique',
      unique: true,
    });

    await queryInterface.addIndex('users', ['is_active'], {
      name: 'idx_users_is_active',
    });

    await queryInterface.addIndex('users', ['is_email_verified'], {
      name: 'idx_users_is_email_verified',
    });

    await queryInterface.addIndex('users', ['created_at'], {
      name: 'idx_users_created_at',
    });

    // Agregar constraints de validación
    await queryInterface.addConstraint('users', {
      fields: ['name'],
      type: 'check',
      name: 'check_name_length',
      where: {
        [Sequelize.sequelize.Op.and]: [
          Sequelize.where(Sequelize.fn('LENGTH', Sequelize.col('name')), {
            [Sequelize.sequelize.Op.gte]: 2
          }),
          Sequelize.where(Sequelize.fn('LENGTH', Sequelize.col('name')), {
            [Sequelize.Sequelize.sequelize.Op.lte]: 100
          })
        ]
      }
    });

    await queryInterface.addConstraint('users', {
      fields: ['email'],
      type: 'check',
      name: 'check_email_format',
      where: {
        email: {
          [Sequelize.Sequelize.sequelize.Op.regexp]: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
        }
      }
    });

    await queryInterface.addConstraint('users', {
      fields: ['password'],
      type: 'check',
      name: 'check_password_length',
      where: {
        [Sequelize.sequelize.Op.and]: [
          Sequelize.where(Sequelize.fn('LENGTH', Sequelize.col('password')), {
            [Sequelize.sequelize.Op.gte]: 6
          }),
          Sequelize.where(Sequelize.fn('LENGTH', Sequelize.col('password')), {
            [Sequelize.sequelize.Op.lte]: 255
          })
        ]
      }
    });
  },

  async down(queryInterface, Sequelize) {
    // Eliminar constraints
    await queryInterface.removeConstraint('users', 'check_name_length');
    await queryInterface.removeConstraint('users', 'check_email_format');
    await queryInterface.removeConstraint('users', 'check_password_length');

    // Eliminar índices
    await queryInterface.removeIndex('users', 'idx_users_email_unique');
    await queryInterface.removeIndex('users', 'idx_users_is_active');
    await queryInterface.removeIndex('users', 'idx_users_is_email_verified');
    await queryInterface.removeIndex('users', 'idx_users_created_at');

    // Eliminar tabla
    await queryInterface.dropTable('users');
  }
};
