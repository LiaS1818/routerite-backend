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
	description: string;
	time: Date;
	location: string;
	budget: number;
	transportation_mode: string;
	img_url?: string;
	itinerary_id: number;
	created_at: Date;
	updated_at: Date;
	deleted_at?: Date;
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

	@AllowNull(true)
	@Column(DataType.INTEGER)
	declare day: number;

	@AllowNull(false)
	@Column(DataType.STRING)
	declare description: string;

	@AllowNull(false)
	@Column(DataType.DATE)
	declare time: Date;

	@AllowNull(false)
	@Column(DataType.STRING)
	declare location: string;

	@AllowNull(false)
	@Column(DataType.DOUBLE)
	declare budget: number;

	@AllowNull(false)
	@Column(DataType.STRING)
	declare transportation_mode: string;

	@AllowNull(true)
	@Column(DataType.STRING)
	declare img_url?: string;

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
	declare deleted_at?: Date;

	@BelongsTo(() => Itinerary, { foreignKey: 'itinerary_id' })
	declare itinerary?: Itinerary;
}
