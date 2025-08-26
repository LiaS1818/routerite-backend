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
  AutoIncrement,
} from 'sequelize-typescript';
import { DataTypes, Optional } from 'sequelize';
import { Itinerary } from './itinerary.model';

export interface ActivityAttributes {
  id: number;
  description: string;        // ← Cambiado de 'name' a 'description'
  time: Date;                 // ← Nuevo campo
  location: string;           // ← Nuevo campo
  presupuesto: number;        // ← Nuevo campo
  transportation_mode: string;// ← Nuevo campo
  img_url?: string;           // ← Nuevo campo (opcional)
  itinerary_id: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface ActivityCreationAttributes
  extends Optional<
    ActivityAttributes,
    'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'img_url'
  > { }

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
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(true) // o false según corresponda
  @Column(DataType.INTEGER)
  declare day: number;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare description: string;  // ← Cambiado de 'name' a 'description'

  @AllowNull(false)
  @Column(DataType.DATE)
  declare time: Date;           // ← Nuevo campo

  @AllowNull(false)
  @Column(DataType.STRING)
  declare location: string;     // ← Nuevo campo

  @AllowNull(false)
  @Column(DataType.DOUBLE)
  declare presupuesto: number;  // ← Nuevo campo

  @AllowNull(false)
  @Column(DataType.STRING)
  declare transportation_mode: string; // ← Nuevo campo

  @AllowNull(true)
  @Column(DataType.STRING)
  declare img_url?: string;     // ← Nuevo campo (opcional)

  @ForeignKey(() => Itinerary)
  @AllowNull(false)
  @Column({
    type: DataType.INTEGER,
    field: 'itinerary_id'       // ← Asegurar que mapee correctamente
  })
  declare itinerary_id: number;

  @CreatedAt
  declare created_at: Date;

  @UpdatedAt
  declare updated_at: Date;

  @DeletedAt
  @Column({
    type: DataTypes.DATE,
    allowNull: true,
  })
  deleted_at: Date | null; // ← Asegúrate que sea Date | null


  // Relación con Itinerary
  @BelongsTo(() => Itinerary, {
    foreignKey: 'itinerary_id',
    as: 'itinerary',
  })
  declare itinerary: Itinerary;

}