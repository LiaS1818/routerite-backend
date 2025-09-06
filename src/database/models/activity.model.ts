import {
	Table,
	Column,
	Model,
	DataType,
	PrimaryKey,
	Default,
	AllowNull,
	CreatedAt,
	UpdatedAt,
	DeletedAt,
	BelongsTo,
	AutoIncrement,
	ForeignKey,
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { Itinerary } from './index';

export interface ActivityAttributes {
	id: number;
	name: string;// <- this
	description: string;
	start_time: string; // <- this
	end_time: string; // <- this
	lat: string;
	lng: string;
	category_name: string;
	category_fsqr_id: string;
	distance_to_start: number;
	budget: number;// <- this
	price: number;
	location: any; // JSON type
	transportation_mode: string; // <- this
	img_url?: string | null; // Added null type for nullable field
	itinerary_id: number;
	created_at: Date;
	updated_at: Date;
	deleted_at?: Date | null; // Added null type for nullable field
}

export interface ActivityCreationAttributes
	extends Optional<
		ActivityAttributes,
		'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'img_url'
	> {}

@Table({
	tableName: 'activities',
	timestamps: true,
	paranoid: true,
	underscored: true,
	freezeTableName: true,
	createdAt: 'created_at',
	updatedAt: 'updated_at',
	deletedAt: 'deleted_at',
})
export class Activity extends Model<
	ActivityAttributes,
	ActivityCreationAttributes
> {
	@PrimaryKey
	@AutoIncrement
	@Column(DataType.INTEGER)
	declare id: number;

	@AllowNull(false)
	@Column(DataType.STRING)
	declare name: string;

	@AllowNull(false)
	@Column(DataType.STRING)
	declare description: string;

	@AllowNull(true)
	@Column(DataType.TIME)
	declare start_time: string;

	@AllowNull(true)
	@Column(DataType.TIME)
	declare end_time: string;

	@AllowNull(false)
	@Column(DataType.STRING)
	declare lat: string; // Changed from number to string

	@AllowNull(false)
	@Column(DataType.STRING)
	declare lng: string; // Changed from number to string

	@AllowNull(false)
	@Column(DataType.STRING())
	declare category_name: string;

	@AllowNull(false)
	@Column(DataType.STRING())
	declare category_fsqr_id: string;

	@AllowNull(false)
	@Column(DataType.FLOAT())
	declare distance_to_start: number;

	@AllowNull(false)
	@Column(DataType.DOUBLE())
	declare budget: number;

	@AllowNull(false)
	@Column(DataType.DOUBLE())
	declare price: number;

	@AllowNull(false)
	@Column(DataType.JSON())
	declare location: any;

	@AllowNull(false)
	@Column(DataType.STRING)
	declare transportation_mode: string;

	@AllowNull(true)
	@Column(DataType.STRING)
	declare img_url?: string | null; // Added null type for nullable field

	@ForeignKey(() => Itinerary)
	@AllowNull(false)
	@Column({
		type: DataType.INTEGER,
		field: 'itinerary_id',
	})
	declare itinerary_id: number;

	@CreatedAt
	declare created_at: Date;

	@UpdatedAt
	declare updated_at: Date;

	@DeletedAt
	declare deleted_at?: Date | null; // Added null type for nullable field

	@BelongsTo(() => Itinerary, { foreignKey: 'itinerary_id' })
	declare itinerary?: Itinerary;
}
