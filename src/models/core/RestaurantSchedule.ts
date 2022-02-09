import { IModelUnfilledAtt } from '@utils/interface/model.base';
import {
  AllowNull,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import Restaurant from './Restaurant';

interface IModelOptional extends IModelUnfilledAtt {}

interface IModel extends Partial<IModelOptional> {
  restaurantId: number;
  day: number;
  startTime: Date | string;
  endTime: Date | string;
}

export type IModelCreate = Omit<IModel, 'id'>;

@Table({
  paranoid: true,
  indexes: [
    {
      fields: ['day', 'startTime', 'endTime'],
    },
    {
      fields: ['day', 'restaurant_id', 'startTime', 'endTime'],
    },
  ],
})
export default class RestaurantSchedule
  extends Model<IModel, IModelCreate>
  implements IModel
{
  @ForeignKey(() => Restaurant)
  @AllowNull(false)
  @Column
  restaurantId!: number;

  @AllowNull(false)
  @Column
  day!: number;

  @AllowNull(false)
  @Column(DataType.TIME)
  startTime!: Date;

  @AllowNull(false)
  @Column(DataType.TIME)
  endTime!: Date;
}
