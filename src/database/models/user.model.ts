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
	nombre: string;
	correo: string;
	contrasena: string;
	pais?: string;
	ciudad?: string;
	verificado: boolean;
	activo: boolean;
	created_at: Date;
	updated_at: Date;
	deleted_at?: Date;
}

export interface UserCreationAttributes
	extends Optional<
		UserAttributes,
		| 'id'
		| 'verificado'
		| 'activo'
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
	nombre!: string;

	@AllowNull(false)
	@Unique
	@Column(DataType.STRING(255))
	correo!: string;

	@AllowNull(false)
	@Column(DataType.STRING(255))
	contrasena!: string;

	@Column(DataType.STRING(100))
	pais?: string;

	@Column(DataType.STRING(100))
	ciudad?: string;

	@AllowNull(false)
	@Default(false)
	@Column(DataType.BOOLEAN)
	verificado!: boolean;

	@AllowNull(false)
	@Default(true)
	@Column(DataType.BOOLEAN)
	activo!: boolean;

	@CreatedAt
	created_at!: Date;

	@UpdatedAt
	updated_at!: Date;

	@DeletedAt
	deleted_at?: Date;

	// Método estático para definir asociaciones
	static associate(models: Record<string, any>) {
		User.hasMany(models.Viaje, {
			foreignKey: 'usuario_id',
			as: 'viajes',
		});
	}
}
