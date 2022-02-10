import db from '@config/database.config';
import Customer from '@models/core/Customer';
import PurchaseHistory from '@models/core/PurchaseHistory';
import Restaurant from '@models/core/Restaurant';
import RestaurantDish from '@models/core/RestaurantDish';
import { HttpException } from '@utils/error';
import { Transaction } from 'sequelize/types';
import { autoInjectable } from 'tsyringe';
import { CustomerBalanceService } from './customer-balance.service';
import { RestaurantBalanceService } from './restaurant-balance.service';

@autoInjectable()
export class PurchaseService {
  constructor(
    private readonly customerBalanceService: CustomerBalanceService,
    private readonly restaurantBalanceService: RestaurantBalanceService,
  ) {}
  /**
   * make a purchase of dishes
   * @param param0
   * @param transaction
   * @returns
   */
  async purchase(
    { dishId, customerId, restaurantId },
    transaction?: Transaction,
  ) {
    const [restaurant, dish] = await Promise.all([
      /** restaurant */
      Restaurant.findByPk(restaurantId, {
        rejectOnEmpty: new HttpException('Restaurant Not Found.', 400),
        attributes: ['id', 'name'],
      }),
      /** dish */
      RestaurantDish.findOne({
        where: {
          restaurantId,
          id: dishId,
        },
        rejectOnEmpty: new HttpException('Dish not Found.', 400),
        attributes: ['price', 'name', 'id'],
      }),
      /** check customer */
      Customer.findByPk(customerId, {
        rejectOnEmpty: new HttpException('Customer data not Found.', 400),
        attributes: ['name', 'id'],
      }),
    ]);

    return await db.transaction({ transaction }, async (transaction) => {
      const { totalAmount, purchase } = await this.storePurchase(
        {
          restaurant,
          dishes: [dish],
          customerId,
        },
        transaction,
      );

      const [customer, restaurantData] = await Promise.all([
        /** decrease customer balance */
        this.customerBalanceService.decreaseBalance(
          { customerId, amount: totalAmount },
          transaction,
        ),
        /** increase restaurant balance */
        this.restaurantBalanceService.increaseBalance(
          { restaurantId, amount: totalAmount },
          transaction,
        ),
      ]);

      return {
        restaurant: {
          ...restaurant.toJSON(),
          dishes: [dish],
        },
        date: purchase.date,
        totalAmount: +totalAmount,
      };
    });
  }

  /**
   * calculate all purchase dishes and store it
   * @param param0
   * @param transaction
   * @returns
   */
  async storePurchase(
    { restaurant, dishes, customerId },
    transaction?: Transaction,
  ) {
    let totalAmount = 0;
    const purchaseHistoryDetails = dishes.map((dish) => {
      totalAmount += dish.price;
      return {
        dishId: dish.id,
        dishName: dish.name,
        restaurantId: restaurant.id,
        amount: dish.price,
      };
    });
    const purchaseHistoryDTO = {
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      customerId,
      date: new Date(),
      amount: totalAmount,
      details: purchaseHistoryDetails,
    };

    const purchase = await PurchaseHistory.create(purchaseHistoryDTO, {
      transaction,
      include: [{ association: 'details' }],
    });

    return {
      purchase,
      totalAmount,
    };
  }
}
