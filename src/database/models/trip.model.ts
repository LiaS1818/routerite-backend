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
} from 'sequelize-typescript';
import sequelize, { Op, Optional } from 'sequelize';
import { User } from './user.model';

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
	notes?: string;
	starting_location?: string;
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
	user_id!: number;

	@AllowNull(false)
	@Column(DataType.STRING(255))
	destination!: string;

	@AllowNull(false)
	@Column(DataType.DATEONLY)
	start_date!: Date;

	@AllowNull(false)
	@Column(DataType.DATEONLY)
	end_date!: Date;

	@AllowNull(false)
	@Default(1)
	@Column(DataType.SMALLINT)
	travelers_count!: number;

	@AllowNull(false)
	@Column(DataType.DECIMAL(10, 2))
	total_budget!: number;

	@Column(DataType.TEXT)
	cover_image?: string;

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
	status!: 'draft' | 'planned' | 'active' | 'completed' | 'cancelled';

	@CreatedAt
	created_at!: Date;

	@UpdatedAt
	updated_at!: Date;

	@DeletedAt
	deleted_at?: Date;

	// Static method to define associations
	static associate(models: Record<string, any>) {
		Trip.belongsTo(models.User, {
			foreignKey: 'user_id',
			as: 'user',
		});
	}
}
