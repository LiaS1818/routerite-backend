// filepath: /home/cardonapablo/Documentos/Proyectos/RouteRite/routerite-backend/src/database/models/trip.model.ts
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
} from 'sequelize-typescript';
import sequelize, { Op, Optional } from 'sequelize';
import { User } from './user.model';
import { LocationInterface } from '../../modules/trips/trip.interfaces';
import { Itinerary } from './itinerary.model';

export interface TripAttributes {
	id: number;
	user_id: number;
	destination: string;
	start_date: Date;
	end_date: Date;
	travelers_count: number;
	total_budget: number;
	experience_type:
		| 'culture'
		| 'adventure'
		| 'gastronomy'
		| 'beach'
		| 'nature';
	guided: boolean;
	cover_image?: string;
	status: 'draft' | 'planned' | 'active' | 'completed' | 'cancelled';
	location: any; // Representa la interfaz LocationInterface como JSON
	created_at: Date;
	updated_at: Date;
	deleted_at?: Date;
}

export interface TripCreationAttributes
	extends Optional<
		TripAttributes,
		'id' | 'created_at' | 'updated_at' | 'deleted_at'
	> {}

@Table({
	tableName: 'trips',
	timestamps: true,
	paranoid: true,
	underscored: true,
	freezeTableName: true,
	createdAt: 'created_at',
	updatedAt: 'updated_at',
	deletedAt: 'deleted_at',
})
export class Trip extends Model<TripAttributes, TripCreationAttributes> {
	@PrimaryKey
	@AutoIncrement
	@Column(DataType.INTEGER)
	declare id: number;

	@AllowNull(false)
	@Column(DataType.INTEGER)
	declare user_id: number;

	@AllowNull(false)
	@Column(DataType.STRING(255))
	declare destination: string;

	@AllowNull(false)
	@Column({
		type: DataType.DATEONLY,
		get() {
			const rawValue = this.getDataValue('start_date');
			return rawValue ? new Date(rawValue) : null;
		},
	})
	declare start_date: Date;

	@AllowNull(false)
	@Column({
		type: DataType.DATEONLY,
		get() {
			const rawValue = this.getDataValue('end_date');
			return rawValue ? new Date(rawValue) : null;
		},
	})
	declare end_date: Date;

	@AllowNull(false)
	@Default(1)
	@Column(DataType.SMALLINT)
	declare travelers_count: number;

	@AllowNull(false)
	@Column({
		type: DataType.DECIMAL(10, 2),
		get() {
			const rawValue = this.getDataValue('total_budget');
			return rawValue ? parseFloat(rawValue.toString()) : null;
		},
	})
	declare total_budget: number;

	@Column(DataType.TEXT)
	declare cover_image?: string;

	@AllowNull(false)
	@Default('draft')
	@Column(
		DataType.ENUM(
			'draft',
			'planned',
			'active',
			'completed',
			'cancelled'
		)
	)
	declare status: 'draft' | 'planned' | 'active' | 'completed' | 'cancelled';

	@Column(DataType.JSON)
	declare location: LocationInterface;

	@CreatedAt
	declare created_at: Date;

	@UpdatedAt
	declare updated_at: Date;

	@DeletedAt
	declare deleted_at?: Date;

	// Static method to define associations
	
	@BelongsTo(() => User, 'user_id')
	declare user?: User;

	@HasMany(() => Itinerary, 'trip_id')
	declare itineraries?: Itinerary[];
}
