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
} from 'sequelize-typescript';
import { Optional } from 'sequelize';

export interface UserAttributes {
	id: number;
	name: string;
	email: string;
	password: string;
	country?: string;
	city?: string;
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
	name!: string;

	@AllowNull(false)
	@Unique
	@Column(DataType.STRING(255))
	email!: string;

	@AllowNull(false)
	@Column(DataType.STRING(255))
	password!: string;

	@Column(DataType.STRING(100))
	country?: string;

	@Column(DataType.STRING(100))
	city?: string;

	@AllowNull(false)
	@Default(false)
	@Column(DataType.BOOLEAN)
	verified!: boolean;

	@AllowNull(false)
	@Default(true)
	@Column(DataType.BOOLEAN)
	active!: boolean;

	@CreatedAt
	created_at!: Date;

	@UpdatedAt
	updated_at!: Date;

	@DeletedAt
	deleted_at?: Date;

	// Static method to define associations
	static associate(models: Record<string, any>) {
		User.hasMany(models.Trip, {
			foreignKey: 'user_id',
			as: 'trips',
		});
	}
}
