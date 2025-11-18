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
	HasMany,
	ForeignKey,
	BelongsToMany,
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { LocationInterface } from '../../modules/trips/trip.interfaces';
import { PostGISPoint } from '../../common/interfaces/PostGISPoint';
import { User, Itinerary, TripInvitation } from './index';

export interface TripAttributes {
	id: number;
	user_id: number;
	destination: string;
	start_date: Date;
	end_date: Date;
	travelers_count: number;
	total_budget: number;
	guided: boolean;
	cover_image?: string | null; // Added null type for nullable field
	status: 'draft' | 'planned' | 'active' | 'completed' | 'cancelled';
	rating?: number | null; // Rating from 1 to 5
	location: any; // Representa la interfaz LocationInterface como JSON
	created_at: Date;
	updated_at: Date;
	deleted_at?: Date | null; // Added null type for nullable field
	// Virtual attributes for relationships
	owner?: any;
	guests?: any[];
	itineraries?: any[];
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

	@ForeignKey(() => User)
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
			if(!rawValue) return null;
			const date = new Date(rawValue);
			const offsetHours = date.getTimezoneOffset() / 60;
			date.setHours(date.getHours() + offsetHours);
			return date;
		},
	})
	declare start_date: Date;

	@AllowNull(false)
	@Column({
		type: DataType.DATEONLY,
		get() {
			const rawValue = this.getDataValue('end_date');
			if(!rawValue) return null;
			const date = new Date(rawValue);
			const offsetHours = date.getTimezoneOffset() / 60;
			date.setHours(date.getHours() + offsetHours);
			return date;
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

	@AllowNull(false)
	@Default('https://lvuodwyfoqekoeadpcyi.supabase.co/storage/v1/object/public/routerite/defaults/trip-covers/default-trip-cover.png')
	@Column(DataType.TEXT)
	declare cover_image?: string | null;

	@AllowNull(false)
	@Default('draft')
	@Column(
		DataType.ENUM('draft', 'planned', 'active', 'completed', 'cancelled')
	)
	declare status: 'draft' | 'planned' | 'active' | 'completed' | 'cancelled';

	@AllowNull(true)
	@Column(DataType.SMALLINT)
	declare rating?: number | null;

	@Column(DataType.JSON)
	declare location: LocationInterface;

	@AllowNull(false)
	@Column({
		type: DataType.STRING(),
	})
	declare lat: string;

	@AllowNull(false)
	@Column({
		type: DataType.STRING(),
	})
	declare lng: string;

	@CreatedAt
	declare created_at: Date;

	@UpdatedAt
	declare updated_at: Date;

	@DeletedAt
	declare deleted_at?: Date | null;

	@BelongsTo(() => User, { foreignKey: 'user_id', as: 'owner' })
	declare owner?: User;

	@HasMany(() => Itinerary, { foreignKey: 'trip_id', as: 'itineraries' })
	declare itineraries?: Itinerary[];

	@BelongsToMany(
		() => User,
		() => TripInvitation,
		//opciones explícitas:
		{ as: 'guests', foreignKey: 'trip_id', otherKey: 'user_id' } as any
	  )
	  declare guests: User[];
}
