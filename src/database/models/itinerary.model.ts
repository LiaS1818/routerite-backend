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
	start_time: string | null; // Properly reflect nullable field
	end_time: string | null; // Properly reflect nullable field
	cover_image?: string | null;
	lat: number;
	lng: number;
	budget: number;
	experience_type_ids: string;
	experience_types: string;
	configured?: boolean;
	created_at: Date;
	updated_at: Date;
	deleted_at?: Date | null; // Added null type for nullable field
	activities?: Activity[];
	trip?: Trip;
}

export interface ItineraryCreationAttributes
	extends Optional<
		ItineraryAttributes,
		'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'configured' | 'activities' | 'trip'
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
		get() {
			const rawValue = this.getDataValue('experience_type_ids');
			return rawValue ? rawValue.split(',') : null;
		},
		set(value: string[]) {
			if(value)
				this.setDataValue('experience_type_ids', value.join(','));
		},
	})
	declare experience_type_ids: string; // 52e928d0bcbc57f1066b7e9b,52e928d0bcbc57f1066b7e9b

	@AllowNull(true)
	@Column({
		type: DataType.STRING(255),
		get() {
			const rawValue = this.getDataValue('experience_types');
			return rawValue ? rawValue.split(',') : null;
		},
		set(value: string[]) {
			if(value)
				this.setDataValue('experience_types', value.join(','));
		},
	})
	declare experience_types: string; // 52e928d0bcbc57f1066b7e9b,52e928d0bcbc57f1066b7e9b

	@AllowNull(true)
	@Column(DataType.STRING(255))
	declare cover_image?: string;

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
			)
		},
		set() {
			throw new Error('No se puede asignar un valor a esta columna virtual');
		}
	})
	declare configured?: boolean;

	@CreatedAt
	declare created_at: Date;

	@UpdatedAt
	declare updated_at: Date;

	@DeletedAt
	declare deleted_at?: Date;

	@BeforeCreate
	static validateBeforeCreate(instance: Itinerary) {
		if(instance.end_time == null || instance.start_time == null) return
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
			order: [['date', 'ASC']]
		});
	}

	@BelongsTo(() => Trip, { foreignKey: 'trip_id', as: 'trip' })
	declare trip?: Trip; // Cambia 'any' por el tipo correcto de Trip si

	@HasMany(() => Activity, { foreignKey: 'itinerary_id', as: 'activities' })
	declare activities?: Activity[]; // Cambia 'any' por el tipo correcto de Activity
}
