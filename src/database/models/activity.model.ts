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
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { Itinerary } from './itinerary.model';
import { Trip } from './trip.model';

export interface ActivityAttributes {
  id: number;
  description: string;
  time: Date;
  location: string;
  presupuesto: number;
  transportationMode: string;
  imgUrl?: string;
  itineraryId: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface ActivityCreationAttributes
  extends Optional<
    ActivityAttributes,
    'id' | 'imgUrl' | 'created_at' | 'updated_at' | 'deleted_at'
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
export class Activity extends Model<ActivityAttributes, ActivityCreationAttributes> {
  @PrimaryKey
  @Default(DataType.INTEGER)
  @Column(DataType.INTEGER)
  declare id: number;

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
  @Column(DataType.FLOAT)
  declare presupuesto: number;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare transportationMode: string;

  @Column(DataType.STRING)
  declare imgUrl?: string;

  @ForeignKey(() => Itinerary)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare itineraryId: number;

  @BelongsTo(() => Itinerary)
  itinerary: Itinerary;


  @CreatedAt
  declare created_at: Date;

  @UpdatedAt
  declare updated_at: Date;

  @DeletedAt
  declare deleted_at?: Date;

//   static associate(models: Record<string, any>) {
//     Activity.belongsTo(models.Itinerary, { foreignKey: 'itineraryId', as: 'itinerary' });
//   }
}
