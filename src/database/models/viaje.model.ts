import {
	Column,
	Model,
	Table,
	DataType,
	BeforeCreate,
	BeforeUpdate,
	AfterCreate,
	Index,
} from 'sequelize-typescript';
import { Op } from 'sequelize';

export enum TipoExperiencia {
	CULTURA = 'cultura',
	AVENTURA = 'aventura',
	GASTRONOMIA = 'gastronomia',
	PLAYA = 'playa',
	NATURALEZA = 'naturaleza',
}

export enum StatusViaje {
	DRAFT = 'draft',
	PLANNED = 'planned',
	ACTIVE = 'active',
	COMPLETED = 'completed',
	CANCELLED = 'cancelled',
}

@Table({
	tableName: 'viajes',
	timestamps: true,
	paranoid: true,
	underscored: true,
	freezeTableName: true,
	createdAt: 'created_at',
	updatedAt: 'updated_at',
	deletedAt: 'deleted_at',
	scopes: {
		withUser: {
			include: [
				{
					association: 'usuario',
					attributes: ['id', 'name', 'email'],
				},
			],
		},
		active: {
			where: {
				status: {
					[Op.notIn]: [StatusViaje.CANCELLED],
				},
			},
		},
		upcoming: {
			where: {
				fecha_inicio: {
					[Op.gte]: new Date(),
				},
			},
		},
		byExperience: (tipoExperiencia: TipoExperiencia) => ({
			where: {
				tipo_experiencia: tipoExperiencia,
			},
		}),
	},
})
export class Viaje extends Model {
	@Column({
		primaryKey: true,
		type: DataType.INTEGER,
		autoIncrement: true,
		allowNull: false,
	})
	declare id: number;

	@Column({
		type: DataType.UUID,
		allowNull: false,
		validate: {
			notNull: true,
		},
		comment: 'Foreign key referencing users.id',
	})
	declare usuario_id: string;

	// Declaración de tipos para las relaciones (sin decoradores)
	declare usuario?: any;

	@Column({
		type: DataType.STRING(255),
		allowNull: false,
		validate: {
			notEmpty: true,
			len: [2, 255],
			isValidDestino(value: string) {
				if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s,.-]+$/.test(value)) {
					throw new Error('El destino solo puede contener letras, espacios, comas, puntos y guiones');
				}
			},
		},
	})
	declare destino: string;

	@Index
	@Column({
		type: DataType.DATEONLY,
		allowNull: false,
		validate: {
			notNull: true,
			isDate: true,
			isFutureOrToday(value: string) {
				const today = new Date();
				today.setHours(0, 0, 0, 0);
				const inputDate = new Date(value);
				if (inputDate < today) {
					throw new Error('La fecha de inicio debe ser presente o futura');
				}
			},
		},
	})
	declare fecha_inicio: Date;

	@Column({
		type: DataType.DATEONLY,
		allowNull: false,
		validate: {
			notNull: true,
			isDate: true,
		},
	})
	declare fecha_fin: Date;

	@Column({
		type: DataType.SMALLINT,
		allowNull: false,
		defaultValue: 1,
		validate: {
			notNull: true,
			isInt: true,
			min: 1,
			max: 20,
		},
	})
	declare n_viajeros: number;

	@Column({
		type: DataType.DECIMAL(10, 2),
		allowNull: false,
		validate: {
			notNull: true,
			isDecimal: true,
			min: 0.01,
		},
	})
	declare presupuesto_total: number;

	@Column({
		type: DataType.ENUM(...Object.values(TipoExperiencia)),
		allowNull: false,
		validate: {
			isIn: [Object.values(TipoExperiencia)],
		},
	})
	declare tipo_experiencia: TipoExperiencia;

	@Column({
		type: DataType.BOOLEAN,
		allowNull: false,
		defaultValue: false,
		validate: {
			isBoolean: true,
		},
	})
	declare acompanamiento: boolean;

	@Column({
		type: DataType.STRING(500),
		allowNull: true,
		validate: {
			isUrl: {
				msg: 'La portada debe ser una URL válida',
			},
			len: [0, 500],
		},
	})
	declare portada?: string;

	@Column({
		type: DataType.ENUM(...Object.values(StatusViaje)),
		allowNull: false,
		defaultValue: StatusViaje.DRAFT,
		validate: {
			isIn: [Object.values(StatusViaje)],
		},
	})
	declare status: StatusViaje;

	@Column({
		type: DataType.TEXT,
		allowNull: true,
	})
	declare notas?: string;

	@Column({
		type: DataType.STRING(255),
		allowNull: true,
		validate: {
			len: [0, 255],
		},
	})
	declare ubicacion_inicio?: string;

	// Hooks
	@BeforeCreate
	static validateDatesOnCreate(instance: Viaje) {
		if (instance.fecha_fin < instance.fecha_inicio) {
			throw new Error('La fecha de fin debe ser mayor o igual a la fecha de inicio');
		}
	}

	@BeforeUpdate
	static validateDatesOnUpdate(instance: Viaje) {
		if (instance.fecha_fin < instance.fecha_inicio) {
			throw new Error('La fecha de fin debe ser mayor o igual a la fecha de inicio');
		}
	}

	@AfterCreate
	static logCreation(instance: Viaje) {
		console.log(`Viaje creado: ID ${instance.id} para usuario ${instance.usuario_id}`);
	}

	// Métodos de instancia
	calculateDuration(): number {
		const inicio = new Date(this.fecha_inicio);
		const fin = new Date(this.fecha_fin);
		const diffTime = Math.abs(fin.getTime() - inicio.getTime());
		return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 para incluir el día de inicio
	}

	getBudgetPerDay(): number {
		const duration = this.calculateDuration();
		return Number((this.presupuesto_total / duration).toFixed(2));
	}

	isActive(): boolean {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const inicio = new Date(this.fecha_inicio);
		const fin = new Date(this.fecha_fin);
		fin.setHours(23, 59, 59, 999);
		return today >= inicio && today <= fin;
	}

	// Métodos estáticos
	static async findByUser(
		userId: string,
		options: { page?: number; limit?: number } = {},
	): Promise<{ viajes: Viaje[]; total: number }> {
		const { page = 1, limit = 10 } = options;
		const offset = (page - 1) * limit;

		const { count, rows } = await Viaje.findAndCountAll({
			where: { usuario_id: userId },
			order: [['fecha_inicio', 'DESC']],
			limit,
			offset,
			include: ['usuario'],
		});

		return {
			viajes: rows,
			total: count,
		};
	}

	static async findUpcoming(userId: string): Promise<Viaje[]> {
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		return await Viaje.findAll({
			where: {
				usuario_id: userId,
				fecha_inicio: {
					[Op.gte]: today,
				},
			},
			order: [['fecha_inicio', 'ASC']],
			include: ['usuario'],
		});
	}

	static async findByDateRange(
		userId: string,
		startDate: Date,
		endDate: Date,
	): Promise<Viaje[]> {
		return await Viaje.findAll({
			where: {
				usuario_id: userId,
				fecha_inicio: {
					[Op.between]: [startDate, endDate],
				},
			},
			order: [['fecha_inicio', 'ASC']],
			include: ['usuario'],
		});
	}

	// Métodos estáticos para usar scopes de manera OOP
	static withUser() {
		return this.scope('withUser');
	}

	static active() {
		return this.scope('active');
	}

	static upcoming() {
		return this.scope('upcoming');
	}

	static byExperience(tipoExperiencia: TipoExperiencia) {
		return this.scope({
			method: ['byExperience', tipoExperiencia],
		});
	}

	// Métodos combinados usando scopes
	static getActiveWithUser() {
		return this.scope(['active', 'withUser']);
	}

	static getUpcomingWithUser() {
		return this.scope(['upcoming', 'withUser']);
	}

	static getByExperienceWithUser(tipoExperiencia: TipoExperiencia) {
		return this.scope(['withUser', { method: ['byExperience', tipoExperiencia] }]);
	}

	/**
	 * Método estático para definir asociaciones
	 */
	static associate(models: any) {
		Viaje.belongsTo(models.User, {
			foreignKey: 'usuario_id',
			as: 'usuario',
			onDelete: 'RESTRICT',
			onUpdate: 'CASCADE',
		});
	}
}
