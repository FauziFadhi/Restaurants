import { Column, Model, Table } from "sequelize-typescript";
import { IModelUnfilledAtt } from "../utils/interface/base.model";


interface IModelOptional extends IModelUnfilledAtt {
  
}

interface IModel extends Partial<IModelOptional> {
  name: string
}

export type IModelCreate = Omit<IModel, 'id'>

@Table({
  paranoid: true,
})
export default class User extends Model<IModel, IModelCreate> {

  @Column
  name!: string;

}