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
	BelongsTo,
	HasMany,
	ForeignKey,
} from 'sequelize-typescript';
import { Op, Optional } from 'sequelize';
import { Trip, Activity } from './index';
import { LocationInterface } from '../../modules/trips/trip.interfaces';

export interface ItineraryAttributes {
	id: number;
	trip_id: number;
	date: Date;
	start_time: string | null; // Properly reflect nullable field
	end_time: string | null; // Properly reflect nullable field
	lat: number;
	lng: number;
	budget: number;
	experience_type_ids: string;
	experience_types: string;
	configured?: boolean;
	max_activities?: number | null; // Nuevo campo añadido
	is_generated?: boolean; // Nuevo campo añadido
	generation_metadata?: object | null; // Nuevo campo añadido
	created_at: Date;
	updated_at: Date;
	deleted_at?: Date | null; // Added null type for nullable field
	activities?: Activity[];
	trip?: Trip;
	starting_location?: LocationInterface; // Nuevo campo añadido
}

export interface ItineraryCreationAttributes
	extends Optional<
		ItineraryAttributes,
		| 'id'
		| 'created_at'
		| 'updated_at'
		| 'deleted_at'
		| 'configured'
		| 'activities'
		| 'trip'
	> {}

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
export class Itinerary extends Model<ItineraryCreationAttributes> {
	@PrimaryKey
	@AutoIncrement
	@Column(DataType.INTEGER)
	declare id: number;

	@ForeignKey(() => Trip)
	@AllowNull(false)
	@Column(DataType.INTEGER)
	declare trip_id: number;

	@AllowNull(false)
	@Column(DataType.DATE)
	declare date: Date;

	@AllowNull(true)
	@Column(DataType.TIME)
	declare start_time: string;

	@AllowNull(true)
	@Column(DataType.TIME)
	declare end_time: string;

	@AllowNull(false)
	@Column(DataType.FLOAT())
	declare lat: number;

	@AllowNull(false)
	@Column(DataType.FLOAT())
	declare lng: number;

	@AllowNull(true)
	@Column(DataType.DECIMAL(10, 2))
	declare budget: number;

	@AllowNull(true)
	@Column({
		type: DataType.STRING(255),
	})
	declare experience_type_ids: string; // 52e928d0bcbc57f1066b7e9b,52e928d0bcbc57f1066b7e9b

	@Column({
		type: DataType.VIRTUAL(DataType.BOOLEAN),
		get() {
			return (
				this.getDataValue('budget') !== null &&
				this.getDataValue('date') !== null &&
				this.getDataValue('end_time') !== null &&
				this.getDataValue('experience_type_ids') !== null &&
				this.getDataValue('experience_types') !== null &&
				this.getDataValue('lat') !== null &&
				this.getDataValue('lng') !== null &&
				this.getDataValue('start_time') !== null
			);
		},
		set() {
			throw new Error(
				'No se puede asignar un valor a esta columna virtual'
			);
		},
	})
	declare configured?: boolean;

	@AllowNull(true)
	@Column(DataType.INTEGER)
	declare max_activities?: number;

	@AllowNull(true)
	@Column(DataType.BOOLEAN)
	declare is_generated?: boolean;

	@AllowNull(true)
	@Column(DataType.JSONB)
	declare generation_metadata?: object;

	@AllowNull(true)
	@Column(DataType.JSONB)
	declare starting_location?: LocationInterface;

	@CreatedAt
	declare created_at: Date;

	@UpdatedAt
	declare updated_at: Date;

	@DeletedAt
	declare deleted_at?: Date;

	@BeforeCreate
	static validateBeforeCreate(instance: Itinerary) {
		if (instance.end_time == null || instance.start_time == null) return;
		if (instance.end_time <= instance.start_time) {
			throw new Error(
				'La hora de fin debe ser mayor que la hora de inicio'
			);
		}
	}

	@BeforeUpdate
	static validateBeforeUpdate(instance: Itinerary) {
		if (instance.end_time <= instance.start_time) {
			throw new Error(
				'La hora de fin debe ser mayor que la hora de inicio'
			);
		}
	}

	@AfterCreate
	static logCreation(instance: Itinerary) {
		console.log(`Nuevo itinerario creado: ${instance.id}`);
	}

	static async findByDateRange(
		tripId: string,
		startDate: Date,
		endDate: Date
	) {
		return await Itinerary.findAll({
			where: {
				trip_id: tripId,
				date: { [Op.between]: [startDate, endDate] },
			},
			order: [['date', 'ASC']],
		});
	}

	@BelongsTo(() => Trip, { foreignKey: 'trip_id', as: 'trip' })
	declare trip?: Trip; // Cambia 'any' por el tipo correcto de Trip si

	@HasMany(() => Activity, { foreignKey: 'itinerary_id', as: 'activities' })
	declare activities?: Activity[]; // Cambia 'any' por el tipo correcto de Activity
}
