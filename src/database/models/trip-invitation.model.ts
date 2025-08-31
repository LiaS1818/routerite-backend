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
	BelongsTo,
	ForeignKey,
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { User, Trip } from './index';

export interface TripInvitationAttributes {
	id: number;
	user_id: number;
	trip_id: number;
	status: 'pending' | 'accepted' | 'rejected';
	invited_by: number;
	created_at: Date;
	updated_at: Date;
	deleted_at?: Date;
}

export interface TripInvitationCreationAttributes
	extends Optional<
		TripInvitationAttributes,
		'id' | 'created_at' | 'updated_at' | 'deleted_at'
	> {}

@Table({
	tableName: 'trip_invitations',
	timestamps: true,
	paranoid: false,
	underscored: true,
	freezeTableName: true,
	createdAt: 'created_at',
	updatedAt: 'updated_at',
	deletedAt: 'deleted_at',
})
export class TripInvitation extends Model<
	TripInvitationAttributes,
	TripInvitationCreationAttributes
> {
	@PrimaryKey
	@AutoIncrement
	@Column(DataType.INTEGER)
	declare id: number;

	@ForeignKey(() => User)
	@AllowNull(false)
	@Column(DataType.INTEGER)
	declare user_id: number;

	@ForeignKey(() => Trip)
	@AllowNull(false)
	@Column(DataType.INTEGER)
	declare trip_id: number;

	@AllowNull(false)
	@Default('pending')
	@Column(DataType.ENUM('pending', 'accepted', 'rejected'))
	declare status: 'pending' | 'accepted' | 'rejected';

	@ForeignKey(() => User)
	@AllowNull(false)
	@Column(DataType.INTEGER)
	declare invited_by: number;

	@CreatedAt
	declare created_at: Date;

	@UpdatedAt
	declare updated_at: Date;

	@DeletedAt
	declare deleted_at?: Date;

	@BelongsTo(() => User, { foreignKey: 'user_id', as: 'invitedUser' })
	declare invitedUser?: User;

	@BelongsTo(() => Trip, { foreignKey: 'trip_id', as: 'trip' })
	declare trip?: Trip;

	@BelongsTo(() => User, { foreignKey: 'invited_by', as: 'inviter' })
	declare inviter?: User;
}
