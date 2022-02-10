import { elasticClient } from '@config/elastic.config';
import { CONST } from '@utils/constant';
import { IModelUnfilledAtt } from '@utils/interface/model.base';
import {
  AllowNull,
  Column,
  DefaultScope,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { IncrementDecrementOptionsWithBy } from 'sequelize/types';
import RestaurantDish from './RestaurantDish';
import RestaurantSchedule from './RestaurantSchedule';

interface IModelOptional extends IModelUnfilledAtt {
  balance: number;
}

interface IModel extends Partial<IModelOptional> {
  name: string;
}

export type IModelCreate = Omit<IModel, 'id'>;

@DefaultScope(() => ({
  attributes: {
    exclude: ['deletedAt', 'createdAt', 'updatedAt'],
  },
}))
@Table({
  paranoid: true,
  indexes: [
    {
      fields: ['name'],
      where: { deletedAt: null },
      unique: true,
    },
  ],
})
export default class Restaurant extends Model<IModel, IModelCreate> {
  @AllowNull(false)
  @Column
  name!: string;

  @Column
  balance?: string;

  @HasMany(() => RestaurantSchedule)
  schedules!: RestaurantSchedule[];

  @HasMany(() => RestaurantDish)
  dishes!: RestaurantDish[];

  static async updateElasticSearch(model: Restaurant, options) {
    if (options.transaction) {
      options.transaction.afterCommit(async () => {
        await elasticClient.update({
          id: model.id,
          index: CONST.ELASTIC.INDEX_RESTAURANT,
          type: '_doc',
          body: { doc: model.toJSON() },
        });
      });
      return model;
    }
    return await elasticClient.update({
      id: model.id,
      index: CONST.ELASTIC.INDEX_RESTAURANT,
      type: '_doc',
      body: { doc: model.toJSON() },
    });
  }

  async incrementWithHook<K extends keyof IModel>(
    fields: K | readonly K[] | Partial<IModel>,
    options?: IncrementDecrementOptionsWithBy<IModel>,
  ) {
    await this.increment(fields, options);
    return await Restaurant.updateElasticSearch(this, options);
  }

  async decrementWithHook<K extends keyof IModel>(
    fields: K | readonly K[] | Partial<IModel>,
    options?: IncrementDecrementOptionsWithBy<IModel>,
  ) {
    await this.increment(fields, options);
    return await Restaurant.updateElasticSearch(this, options);
  }
}
