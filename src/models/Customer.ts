import { AllowNull, Column, Default, HasMany, Model, Table } from "sequelize-typescript";
import { IModelUnfilledAtt } from "../utils/interface/base.model";
import PurchaseHistory from "./PurchaseHistory";


interface IModelOptional extends IModelUnfilledAtt {
  balance: number
}

interface IModel extends Partial<IModelOptional> {
  name: string
}

export type IModelCreate = Omit<IModel, 'id'>

@Table({
  paranoid: true,
  indexes: [
    {
      fields: ['name'],
    },
    {
      fields: ['balance'],
    }
  ]
})
export default class Customer extends Model<IModel, IModelCreate> implements IModel {
  
  @AllowNull(false)
  @Column
  name!: string;

  @Default(0)
  @AllowNull(false)
  @Column
  balance?: number;

  @HasMany(() => PurchaseHistory)
  purchaseHistories: PurchaseHistory[]

}