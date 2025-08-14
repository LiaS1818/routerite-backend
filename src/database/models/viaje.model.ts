import {
	Table,
	Column,
	Model,
	DataType,
	PrimaryKey,
	AutoIncrement,
	AllowNull,
	Default,
	CreatedAt,
	UpdatedAt,
	DeletedAt,
	BeforeCreate,
	BeforeUpdate,
	AfterCreate,
} from 'sequelize-typescript';
import sequelize, { Op, Optional } from 'sequelize';
import { User } from './user.model';

export interface ViajeAttributes {
	id: number;
	usuario_id: number;
	destino: string;
	fecha_inicio: Date;
	fecha_fin: Date;
	n_viajeros: number;
	presupuesto_total: number;
	tipo_experiencia:
		| 'cultura'
		| 'aventura'
		| 'gastronomia'
		| 'playa'
		| 'naturaleza';
	acompanamiento: boolean;
	portada?: string;
	status: 'draft' | 'planned' | 'active' | 'completed' | 'cancelled';
	notas?: string;
	ubicacion_inicio?: string;
	created_at: Date;
	updated_at: Date;
	deleted_at?: Date;
}

export interface ViajeCreationAttributes
	extends Optional<
		ViajeAttributes,
		'id' | 'created_at' | 'updated_at' | 'deleted_at'
	> {}

@Table({
	tableName: 'viajes',
	timestamps: true,
	paranoid: true,
	underscored: true,
	freezeTableName: true,
	createdAt: 'created_at',
	updatedAt: 'updated_at',
	deletedAt: 'deleted_at',
})
export class Viaje extends Model<ViajeAttributes, ViajeCreationAttributes> {
	@PrimaryKey
	@AutoIncrement
	@Column(DataType.INTEGER)
	declare id: number;

	@AllowNull(false)
	@Column(DataType.INTEGER)
	usuario_id!: number;

	@AllowNull(false)
	@Column(DataType.STRING(255))
	destino!: string;

	@AllowNull(false)
	@Column(DataType.DATEONLY)
	fecha_inicio!: Date;

	@AllowNull(false)
	@Column(DataType.DATEONLY)
	fecha_fin!: Date;

	@AllowNull(false)
	@Default(1)
	@Column(DataType.SMALLINT)
	n_viajeros!: number;

	@AllowNull(false)
	@Column(DataType.DECIMAL(10, 2))
	presupuesto_total!: number;

	@AllowNull(false)
	@Column(
		DataType.ENUM(
			'cultura',
			'aventura',
			'gastronomia',
			'playa',
			'naturaleza'
		)
	)
	tipo_experiencia!:
		| 'cultura'
		| 'aventura'
		| 'gastronomia'
		| 'playa'
		| 'naturaleza';

	@AllowNull(false)
	@Default(false)
	@Column(DataType.BOOLEAN)
	acompanamiento!: boolean;

	@Column(DataType.STRING(500))
	portada?: string;

	@AllowNull(false)
	@Default('draft')
	@Column(
		DataType.ENUM('draft', 'planned', 'active', 'completed', 'cancelled')
	)
	status!: 'draft' | 'planned' | 'active' | 'completed' | 'cancelled';

	@Column(DataType.TEXT)
	notas?: string;

	@Column(DataType.STRING(255))
	ubicacion_inicio?: string;

	@CreatedAt
	created_at!: Date;

	@UpdatedAt
	updated_at!: Date;

	@DeletedAt
	deleted_at?: Date;

	// Hooks
	@BeforeCreate
	static validateBeforeCreate(instance: Viaje) {
		if (instance.fecha_fin < instance.fecha_inicio) {
			throw new Error(
				'La fecha de fin debe ser mayor o igual a la fecha de inicio'
			);
		}
	}

	@BeforeUpdate
	static validateBeforeUpdate(instance: Viaje) {
		if (instance.fecha_fin < instance.fecha_inicio) {
			throw new Error(
				'La fecha de fin debe ser mayor o igual a la fecha de inicio'
			);
		}
	}

	@AfterCreate
	static logCreation(instance: Viaje) {
		console.log(
			`Nuevo viaje creado: ${instance.id} para usuario ${instance.usuario_id}`
		);
	}

	// Métodos de instancia
	calculateDuration(): number {
		const timeDiff = this.fecha_fin.getTime() - this.fecha_inicio.getTime();
		return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // +1 para incluir ambos días
	}

	getBudgetPerDay(): number {
		const duration = this.calculateDuration();
		return Number((this.presupuesto_total / duration).toFixed(2));
	}

	isActive(): boolean {
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const inicio = new Date(this.fecha_inicio);
		inicio.setHours(0, 0, 0, 0);

		const fin = new Date(this.fecha_fin);
		fin.setHours(23, 59, 59, 999);

		return today >= inicio && today <= fin && this.status === 'active';
	}

	// Métodos estáticos
	static async findByUser(userId: number, options: any = {}) {
		return await Viaje.findAll({
			where: { usuario_id: userId },
			order: [['fecha_inicio', 'DESC']],
			include: [
				{
					model: User,
					as: 'usuario',
					attributes: ['id', 'nombre', 'correo'],
				},
			],
			...options,
		});
	}

	static async findUpcoming(userId: number) {
		const today = new Date();
		return await Viaje.findAll({
			where: {
				usuario_id: userId,
				fecha_inicio: {
					[Op.gte]: today,
				},
			},
			order: [['fecha_inicio', 'ASC']],
			limit: 10,
		});
	}

	static async findByDateRange(
		userId: number,
		startDate: Date,
		endDate: Date
	) {
		return await Viaje.findAll({
			where: {
				usuario_id: userId,
				[Op.or]: [
					{
						fecha_inicio: {
							[Op.between]: [startDate, endDate],
						},
					},
					{
						fecha_fin: {
							[Op.between]: [startDate, endDate],
						},
					},
					{
						[Op.and]: [
							{ fecha_inicio: { [Op.lte]: startDate } },
							{ fecha_fin: { [Op.gte]: endDate } },
						],
					},
				],
			},
			attributes: ['id', 'fecha_inicio', 'fecha_fin', 'destino'],
		});
	}

	// Método estático para definir asociaciones
	static associate(models: {
		User: sequelize.ModelStatic<sequelize.Model<any, any>>;
	}) {
		Viaje.belongsTo(models.User, {
			foreignKey: 'usuario_id',
			as: 'usuario',
		});
	}
}
