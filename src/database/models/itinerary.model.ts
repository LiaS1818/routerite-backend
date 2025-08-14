import { Column, Model, Table, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
// import { Trip } from './trip.model'; // si ya tienes Trip creado

@Table({
  tableName: 'itineraries',
  timestamps: true,
})
export class Itinerary extends Model {
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
  })
  declare id: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare date: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare startTime: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare endTime: Date;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare startLocation: string;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  declare budget: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare experienceType: string;

  // Si luego activas la relación con Trip:
  // @ForeignKey(() => Trip)
  // @Column({
  //   type: DataType.UUID,
  //   allowNull: false,
  // })
  // declare tripId: string;

  // @BelongsTo(() => Trip)
  // declare trip: Trip;
}
