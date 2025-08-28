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

export interface ItineraryAttributes {
	id: number;
	trip_id: number;
	date: Date;
	start_time: string;
	end_time: string;
	lat: number;
	lng: number;
	budget: number;
	experience_type_ids: string;
	experience_types: string;
	configured?: boolean;
	created_at: Date;
	updated_at: Date;
	deleted_at?: Date | null;
	activities?: Activity[];
	trip?: Trip;
}

export interface ItineraryCreationAttributes
	extends Optional<
		ItineraryAttributes,
		'id' | 'created_at' | 'updated_at' | 'deleted_at'
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

	@AllowNull(false)
	@Column(DataType.TIME)
	declare start_time: string;

	@AllowNull(false)
	@Column(DataType.TIME)
	declare end_time: string;

	@AllowNull(false)
	@Column(DataType.FLOAT())
	declare lat: number;

	@AllowNull(false)
	@Column(DataType.FLOAT())
	declare lng: number;

	@AllowNull(false)
	@Column(DataType.DECIMAL(10, 2))
	declare budget: number;

	@AllowNull(false)
	@Column(DataType.STRING(100))
	declare experience_type_ids: string; // 52e928d0bcbc57f1066b7e9b,52e928d0bcbc57f1066b7e9b
	// TODO: Getter, setter to return an array to be sento to FSQR

	@AllowNull(false)
	@Column(DataType.STRING(100))
	declare experience_types: string; // 52e928d0bcbc57f1066b7e9b,52e928d0bcbc57f1066b7e9b
	// TODO: Getter, setter to return an array to be sento to frontend

	get configured(): boolean {
		// Check every single nullable field has a none-null value
		return (
			this.budget !== null &&
			this.date !== null &&
			this.end_time !== null &&
			this.experience_type_ids !== null &&
			this.experience_types !== null &&
			this.lat !== null &&
			this.lng !== null &&
			this.start_time !== null &&
			this.trip_id !== null &&
			this.getDataValue('experience_types') !== null &&
			this.getDataValue('experience_type_ids') !== null
		);
	}

	@CreatedAt
	declare created_at: Date;

	@UpdatedAt
	declare updated_at: Date;

	@DeletedAt
	@AllowNull(true)
	declare deleted_at?: Date;

	@BeforeCreate
	static validateBeforeCreate(instance: Itinerary) {
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
