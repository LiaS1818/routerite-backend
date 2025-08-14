import { Column, Model, Table, DataType } from 'sequelize-typescript';

@Table({
	tableName: 'users',
	timestamps: true, // crea automáticamente createdAt y updatedAt
})
export class User extends Model {
	@Column({
		primaryKey: true,
		type: DataType.UUID,
		defaultValue: DataType.UUIDV4,
		comment: 'Primary key - UUID for user identification',
	})
	declare id: string;

	@Column({
		type: DataType.STRING,
		allowNull: false,
		validate: {
			notEmpty: true,
			len: [2, 100],
		},
		comment: 'User full name',
	})
	declare name: string;

	@Column({
		type: DataType.STRING,
		unique: true,
		allowNull: false,
		validate: {
			isEmail: true,
			notEmpty: true,
		},
		comment: 'User email address - must be unique',
	})
	declare email: string;

	@Column({
		type: DataType.STRING,
		allowNull: false,
		validate: {
			notEmpty: true,
			len: [6, 255],
		},
		comment: 'User password (hashed)',
	})
	declare password: string;

	@Column({
		type: DataType.BOOLEAN,
		defaultValue: true,
		comment: 'Whether the user account is active',
	})
	declare isActive: boolean;

	@Column({
		type: DataType.BOOLEAN,
		defaultValue: false,
		comment: 'Whether the user email has been verified',
	})
	declare isEmailVerified: boolean;

	@Column({
		type: DataType.BOOLEAN,
		allowNull: false,
		defaultValue: false,
		comment: 'Whether the user has premium subscription',
	})
	declare isPremium: boolean;

	// Declaración de tipos para las relaciones (sin decoradores)
	declare viajes?: any[];

	/**
	 * Método estático para definir asociaciones
	 */
	static associate(models: any) {
		User.hasMany(models.Viaje, {
			foreignKey: 'usuario_id',
			as: 'viajes',
		});
	}
}
