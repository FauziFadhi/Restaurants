import { AllowNull, Column, Default, ForeignKey, HasMany, Model, Table } from "sequelize-typescript";
import { IModelUnfilledAtt } from "../utils/interface/base.model";
import Customer from "./Customer";
import PurchaseHistoryDetail from "./PurchaseHistoryDetail";
import Restaurant from "./Restaurant";


interface IModelOptional extends IModelUnfilledAtt {
}

interface IModel extends Partial<IModelOptional> {
  restaurantId: number
  restaurantName: string
  customerId: number
  amount: number
  date: Date
}

export type IModelCreate = Omit<IModel, 'id'>

@Table({
  paranoid: true,
  indexes: [
    {
      fields: ['restaurant_id', 'date']
    },
    {
      fields: ['restaurant_id', 'amount']
    },
  ]
})
export default class PurchaseHistory extends Model<IModel, IModelCreate> implements IModel {

  @ForeignKey(() => Restaurant)
  @AllowNull(false)
  @Column
  restaurantId!: number;

  @ForeignKey(() => Customer)
  @AllowNull(false)
  @Column
  customerId!: number;
  
  @AllowNull(false)
  @Column
  restaurantName!: string;

  @Default(0)
  @AllowNull(false)
  @Column
  amount!: number;

  @AllowNull(false)
  @Column
  date!: Date;

  @HasMany(() => PurchaseHistoryDetail)
  details: PurchaseHistoryDetail[]

}