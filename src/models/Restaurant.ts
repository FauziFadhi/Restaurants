import { AllowNull, Column, DefaultScope, HasMany, Model, Table } from "sequelize-typescript";
import { IModelUnfilledAtt } from "../utils/interface/base.model";
import RestaurantDish from "./RestaurantDish";
import RestaurantSchedule from "./RestaurantSchedule";


interface IModelOptional extends IModelUnfilledAtt {
  balance: number
}

interface IModel extends Partial<IModelOptional> {
  name: string
}

export type IModelCreate = Omit<IModel, 'id'>


@DefaultScope(() => ({
  attributes: {
    exclude: ['deletedAt', 'createdAt', 'updatedAt']
  }
}))
@Table({
  paranoid: true,
  indexes: [
    {
      fields: ['name'], where:{deletedAt: null}, unique: true
    }
  ]
})
export default class Restaurant extends Model<IModel, IModelCreate> {

  @AllowNull(false)
  @Column
  name!: string;
  
  @Column
  balance?: string;

  @HasMany(() => RestaurantSchedule)
  schedules!: RestaurantSchedule[]

  @HasMany(() => RestaurantDish)
  dishes!: RestaurantDish[]
}