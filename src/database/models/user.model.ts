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
	})
	declare id: string;

	@Column({
		type: DataType.STRING,
		allowNull: false,
	})
	declare name: string;

	@Column({
		type: DataType.STRING,
		unique: true,
		allowNull: false,
	})
	declare email: string;

	@Column({
		type: DataType.STRING,
		allowNull: false,
	})
	declare password: string;

	@Column({
		type: DataType.BOOLEAN,
		defaultValue: true,
	})
	declare isActive: boolean;
}
