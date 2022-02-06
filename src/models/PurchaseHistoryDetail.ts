import { AllowNull, Column, Default, ForeignKey, Model, Table } from "sequelize-typescript";
import { IModelUnfilledAtt } from "../utils/interface/base.model";
import Restaurant from "./Restaurant";
import RestaurantDish from "./RestaurantDish";


interface IModelOptional extends IModelUnfilledAtt {
}

interface IModel extends Partial<IModelOptional> {
  restaurantId: number
  purchaseHistoryId: number
  dishId: number
  dishName: string
  amount: number
}

export type IModelCreate = Omit<IModel, 'id'>

@Table({
  paranoid: true,
  indexes: [{
    fields: ['restaurant_id', 'amount']
  }]
})
export default class PurchaseHistory extends Model<IModel, IModelCreate> implements IModel {

  @ForeignKey(() => Restaurant)
  @AllowNull(false)
  @Column
  restaurantId!: number;

  @ForeignKey(() => PurchaseHistory)
  @AllowNull(false)
  @Column
  purchaseHistoryId!: number;

  @ForeignKey(() => RestaurantDish)
  @AllowNull(false)
  @Column
  dishId!: number;

  
  @AllowNull(false)
  @Column
  dishName!: string;

  @Default(0)
  @AllowNull(false)
  @Column
  amount!: number;

  @AllowNull(false)
  @Column
  date!: Date;

}