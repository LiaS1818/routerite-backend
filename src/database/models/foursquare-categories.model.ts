import { Column, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'foursquare_categories', timestamps: false })
export class FoursquareCategory extends Model<FoursquareCategory> {
  @Column({ primaryKey: true })
  declare id: string;

  @Column
  declare name: string;

  @Column
  declare label: string;
}
