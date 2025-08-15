'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('viajes', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      usuario_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      destino: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      fecha_inicio: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      fecha_fin: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      n_viajeros: {
        type: Sequelize.SMALLINT,
        allowNull: false,
        defaultValue: 1,
      },
      presupuesto_total: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      tipo_experiencia: {
        type: Sequelize.ENUM('cultura', 'aventura', 'gastronomia', 'playa', 'naturaleza'),
        allowNull: false,
      },
      acompanamiento: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      portada: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('draft', 'planned', 'active', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'draft',
      },
      notas: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      ubicacion_inicio: {
        type: Sequelize.STRING(255),
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

    // Crear índices
    await queryInterface.addIndex('viajes', ['usuario_id', 'fecha_inicio'], {
      name: 'idx_viajes_usuario_fecha_inicio',
    });

    await queryInterface.addIndex('viajes', ['fecha_inicio'], {
      name: 'idx_viajes_fecha_inicio',
    });

    await queryInterface.addIndex('viajes', ['status'], {
      name: 'idx_viajes_status',
    });

    await queryInterface.addIndex('viajes', ['tipo_experiencia'], {
      name: 'idx_viajes_tipo_experiencia',
    });

    // Agregar constraint para validar que fecha_fin >= fecha_inicio
    await queryInterface.addConstraint('viajes', {
      fields: ['fecha_inicio', 'fecha_fin'],
      type: 'check',
      name: 'check_fechas_validas',
      where: {
        [Sequelize.sequelize.Op.and]: [
          Sequelize.literal('fecha_fin >= fecha_inicio')
        ]
      }
    });

    // Agregar constraint para validar presupuesto positivo
    await queryInterface.addConstraint('viajes', {
      fields: ['presupuesto_total'],
      type: 'check',
      name: 'check_presupuesto_positivo',
      where: {
        presupuesto_total: {
          [Sequelize.sequelize.Op.gt]: 0
        }
      }
    });

    // Agregar constraint para validar número de viajeros
    await queryInterface.addConstraint('viajes', {
      fields: ['n_viajeros'],
      type: 'check',
      name: 'check_n_viajeros_valido',
      where: {
        [Sequelize.sequelize.Op.and]: [
          { n_viajeros: { [Sequelize.sequelize.Op.gte]: 1 } },
          { n_viajeros: { [Sequelize.sequelize.Op.lte]: 20 } }
        ]
      }
    });
  },

  async down(queryInterface, Sequelize) {
    // Eliminar constraints
    await queryInterface.removeConstraint('viajes', 'check_fechas_validas');
    await queryInterface.removeConstraint('viajes', 'check_presupuesto_positivo');
    await queryInterface.removeConstraint('viajes', 'check_n_viajeros_valido');

    // Eliminar índices
    await queryInterface.removeIndex('viajes', 'idx_viajes_usuario_fecha_inicio');
    await queryInterface.removeIndex('viajes', 'idx_viajes_fecha_inicio');
    await queryInterface.removeIndex('viajes', 'idx_viajes_status');
    await queryInterface.removeIndex('viajes', 'idx_viajes_tipo_experiencia');

    // Eliminar ENUMs (PostgreSQL)
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_viajes_tipo_experiencia";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_viajes_status";');

    // Eliminar tabla
    await queryInterface.dropTable('viajes');
  }
};
