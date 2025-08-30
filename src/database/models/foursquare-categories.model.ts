import { Column, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'foursquare_categories', timestamps: false })
export class FoursquareCategory extends Model {
  @Column({ primaryKey: true })
  declare id: string;

  @Column
  name: string;

  @Column
  label: string;
}