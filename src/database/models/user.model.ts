import {
	Table,
	Column,
	Model,
	DataType,
	PrimaryKey,
	AutoIncrement,
	Unique,
	AllowNull,
	Default,
	CreatedAt,
	UpdatedAt,
	DeletedAt,
	HasMany,
	BelongsToMany,
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { Trip, TripInvitation } from './index';

export interface UserAttributes {
	id: number;
	name: string;
	email: string;
	password: string;
	profile_picture?: string;
	verified: boolean;
	active: boolean;
	created_at: Date;
	updated_at: Date;
	deleted_at?: Date;
}

export interface UserCreationAttributes
	extends Optional<
		UserAttributes,
		| 'id'
		| 'verified'
		| 'active'
		| 'profile_picture'
		| 'created_at'
		| 'updated_at'
		| 'deleted_at'
	> {}

@Table({
	tableName: 'users',
	timestamps: true,
	paranoid: true,
	underscored: true,
	freezeTableName: true,
	createdAt: 'created_at',
	updatedAt: 'updated_at',
	deletedAt: 'deleted_at',
})
export class User extends Model<UserAttributes, UserCreationAttributes> {
	@PrimaryKey
	@AutoIncrement
	@Column(DataType.INTEGER)
	declare id: number;

	@AllowNull(false)
	@Column(DataType.STRING(100))
	declare name: string;

	@AllowNull(false)
	@Unique
	@Column(DataType.STRING(255))
	declare email: string;

	@AllowNull(false)
	@Column(DataType.STRING(255))
	declare password: string;

	@AllowNull(false)
	@Default(false)
	@Column(DataType.BOOLEAN)
	declare verified: boolean;

	@AllowNull(false)
	@Default(true)
	@Column(DataType.BOOLEAN)
	declare active: boolean;

	@AllowNull(true)
	@Column(DataType.STRING(255))
	declare profile_picture?: string;

	@CreatedAt
	declare created_at: Date;

	@UpdatedAt
	declare updated_at: Date;

	@DeletedAt
	declare deleted_at?: Date;

	@HasMany(() => Trip, { foreignKey: 'user_id', as: 'owned_trips' })
	declare owned_trips?: Trip[];

	@BelongsToMany(() => Trip, () => TripInvitation)
	trips: Trip[];
}
