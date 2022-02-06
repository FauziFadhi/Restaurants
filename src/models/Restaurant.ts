import { AllowNull, Column, Model, Table } from "sequelize-typescript";
import { IModelUnfilledAtt } from "../utils/interface/base.model";


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

}