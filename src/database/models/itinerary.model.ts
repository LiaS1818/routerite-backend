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
	HasMany,
} from 'sequelize-typescript';
import sequelize, { Op, Optional } from 'sequelize';
import { Activity } from './activity.model';
// import { Trip } from './trip.model';

// Interfaces
export interface ItineraryAttributes {
	id: string;
	trip_id?: number;
	date: Date;
	start_time: string;
	end_time: string;
	start_location: string;
	budget: number;
	experience_type: string;
	activities?: Activity[];
	created_at?: Date;
	updated_at?: Date;
	deleted_at: Date | null;
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
	@AutoIncrement // ✅ Esto es crucial
	@Column(DataType.INTEGER)
	declare id: number;

	@AllowNull(false)
	@Column(DataType.INTEGER)
	declare trip_id: number;

	@AllowNull(false)
	@Column(DataType.DATE)
	declare date: Date;

	@AllowNull(false)
	@Column(DataType.TIME)
	declare start_time: string;

	@AllowNull(false)
	@Column(DataType.TIME)
	declare end_time: string;

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

	@HasMany(() => Activity, {
		foreignKey: 'itinerary_id', // ← debe coincidir con el nombre en la BD
		as: 'activities'
	})
	activities: Activity[];

}
