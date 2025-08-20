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
	ForeignKey,
	BelongsTo,
} from 'sequelize-typescript';
import sequelize, { Op, Optional } from 'sequelize';
// import { Trip } from './trip.model';

// Interfaces
export interface ItineraryAttributes {
	id: string;
	trip_id?: string;
	date: Date;
	start_time: Date;
	end_time: Date;
	start_location: string;
	budget: number;
	experience_type: string;
	created_at: Date;
	updated_at: Date;
	deleted_at?: Date;
}

export interface ItineraryCreationAttributes
	extends Optional<ItineraryAttributes, 'id' | 'created_at' | 'updated_at' | 'deleted_at'> {}

@Table({
	tableName: 'itineraries',
	timestamps: true,
	paranoid: true,
	underscored: true,
	freezeTableName: true,
	createdAt: 'created_at',
	updatedAt: 'updated_at',
	deletedAt: 'deleted_at',
})
export class Itinerary extends Model<ItineraryAttributes, ItineraryCreationAttributes> {
	@PrimaryKey
	@Default(DataType.UUIDV4)
	@Column(DataType.UUID)
	declare id: string;

	@AllowNull(false)
	@Column(DataType.INTEGER)
	declare trip_id?: string;

	@AllowNull(false)
	@Column(DataType.DATEONLY)
	declare date: Date;

	@AllowNull(false)
	@Column(DataType.TIME)
	declare start_time: Date;

	@AllowNull(false)
	@Column(DataType.TIME)
	declare end_time: Date;

	@AllowNull(false)
	@Column(DataType.STRING(255))
	declare start_location: string;

	@AllowNull(false)
	@Column(DataType.DECIMAL(10, 2))
	declare budget: number;

	@AllowNull(false)
	@Column(DataType.STRING(100))
	declare experience_type: string;

	@CreatedAt
	declare created_at: Date;

	@UpdatedAt
	declare updated_at: Date;

	@DeletedAt
	declare deleted_at: Date;

	// // Relaciones
	// @BelongsTo(() => Trip)
	// trip?: Trip;

	// Hooks
	@BeforeCreate
	static validateBeforeCreate(instance: Itinerary) {
		if (instance.end_time <= instance.start_time) {
			throw new Error('La hora de fin debe ser mayor que la hora de inicio');
		}
	}

	@BeforeUpdate
	static validateBeforeUpdate(instance: Itinerary) {
		if (instance.end_time <= instance.start_time) {
			throw new Error('La hora de fin debe ser mayor que la hora de inicio');
		}
	}

	@AfterCreate
	static logCreation(instance: Itinerary) {
		console.log(`Nuevo itinerario creado: ${instance.id}`);
	}

	// Métodos de instancia
	calculateDurationHours(): number {
		const start = new Date(`1970-01-01T${this.start_time}Z`);
		const end = new Date(`1970-01-01T${this.end_time}Z`);
		return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
	}

	isWithinBudget(maxBudget: number): boolean {
		return this.budget <= maxBudget;
	}

	// // Métodos estáticos
	// static async findByTrip(tripId: string, options: any = {}) {
	// 	return await Itinerary.findAll({
	// 		where: { trip_id: tripId },
	// 		order: [['date', 'ASC'], ['start_time', 'ASC']],
	// 		include: [{ model: Trip, as: 'trip' }],
	// 		...options,
	// 	});
	// }

	static async findByDateRange(tripId: string, startDate: Date, endDate: Date) {
		return await Itinerary.findAll({
			where: {
				trip_id: tripId,
				date: { [Op.between]: [startDate, endDate] },
			},
			order: [['date', 'ASC']],
		});
	}

	static associate(models: Record<string, any>) {
		Itinerary.belongsTo(models.Trip, {
			foreignKey: 'trip_id',
			as: 'trip',
		});
	}
}
