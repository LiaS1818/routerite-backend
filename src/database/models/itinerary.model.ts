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

	// @ForeignKey(() => Trip)
	// @Column(DataType.UUID)
	// trip_id?: string;

	@AllowNull(false)
	@Column(DataType.DATEONLY)
	date!: Date;

	@AllowNull(false)
	@Column(DataType.TIME)
	start_time!: Date;

	@AllowNull(false)
	@Column(DataType.TIME)
	end_time!: Date;

	@AllowNull(false)
	@Column(DataType.STRING(255))
	start_location!: string;

	@AllowNull(false)
	@Column(DataType.DECIMAL(10, 2))
	budget!: number;

	@AllowNull(false)
	@Column(DataType.STRING(100))
	experience_type!: string;

	@CreatedAt
	created_at!: Date;

	@UpdatedAt
	updated_at!: Date;

	@DeletedAt
	deleted_at?: Date;

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
}
