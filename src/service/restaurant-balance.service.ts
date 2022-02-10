import Restaurant from '@models/core/Restaurant';
import { HttpException } from '@utils/error';
import { Transaction } from 'sequelize/types';
import { autoInjectable } from 'tsyringe';

@autoInjectable()
export class RestaurantBalanceService {
  /**
   * find and decrease restaurant balance
   * @param param0
   * @param transaction
   */
  async decreaseBalance(
    { restaurantId, amount },
    transaction?: Transaction,
  ): Promise<Restaurant> {
    const restaurant = await Restaurant.findByPk(restaurantId, {
      attributes: ['id', 'balance'],
      rejectOnEmpty: new HttpException('Restaurant balance not found.', 404),
    });

    if (+restaurant.balance <= amount) {
      throw new HttpException('Your restaurant balance not enough.', 400);
    }

    return await restaurant.decrement('balance', { by: amount, transaction });
  }

  /**
   * find and increase restaurant balance
   * @param param0
   * @param transaction
   */
  async increaseBalance(
    { restaurantId, amount },
    transaction?: Transaction,
  ): Promise<Restaurant> {
    const restaurant = await Restaurant.findByPk(restaurantId, {
      attributes: ['id', 'balance'],
      rejectOnEmpty: new HttpException('Restaurant balance not found.', 404),
    });

    return await restaurant.increment('balance', { by: amount, transaction });
  }
}
