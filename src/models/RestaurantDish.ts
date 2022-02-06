import { AllowNull, Column, Default, ForeignKey, Model, Table } from "sequelize-typescript";
import { IModelUnfilledAtt } from "../utils/interface/base.model";
import Restaurant from "./Restaurant";


interface IModelOptional extends IModelUnfilledAtt {
  price: number
}

interface IModel extends Partial<IModelOptional> {
  restaurantId: number
  name: string
}

export type IModelCreate = Omit<IModel, 'id'>

@Table({
  paranoid: true,
  indexes: [
    {
      fields: ['price', 'name']
    },
    {
      fields: ['name']
    },
    {
      fields: ['restaurant_id', 'name']
    }
  ]
})
export default class RestaurantDish extends Model<IModel, IModelCreate> implements IModel {

  @ForeignKey(() => Restaurant)
  @AllowNull(false)
  @Column
  restaurantId!: number;
  
  @AllowNull(false)
  @Column
  name!: string;

  @Default(0)
  @AllowNull(false)
  @Column
  price?: number;

}