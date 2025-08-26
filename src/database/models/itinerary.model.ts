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
import { Trip, Activity } from './index'

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

	@BelongsTo(() => Trip, { foreignKey: 'trip_id', as: 'trip' })
	declare trip?: Trip; // Cambia 'any' por el tipo correcto de Trip si

	@HasMany(() => Activity, { foreignKey: 'itinerary_id', as: 'activities' })
	declare activities?: Activity[]; // Cambia 'any' por el tipo correcto de Activity

}
