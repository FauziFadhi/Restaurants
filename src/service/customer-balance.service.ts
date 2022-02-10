import Customer from '@models/core/Customer';
import { HttpException } from '@utils/error';
import { Transaction } from 'sequelize/types';
import { autoInjectable } from 'tsyringe';

@autoInjectable()
export class CustomerBalanceService {
  /**
   * find and decrease customer balance
   * @param param0
   * @param transaction
   */
  async decreaseBalance(
    { customerId, amount },
    transaction?: Transaction,
  ): Promise<Customer> {
    const customer = await Customer.findByPk(customerId, {
      attributes: ['id', 'balance'],
      rejectOnEmpty: new HttpException('Customer balance not found.', 404),
    });

    if (+customer.balance <= amount) {
      throw new HttpException('Your balance not enough.', 400);
    }

    return await customer.decrement('balance', { by: amount, transaction });
  }

  /**
   * find and increase customer balance
   * @param param0
   * @param transaction
   */
  async increaseBalance(
    { customerId, amount },
    transaction?: Transaction,
  ): Promise<Customer> {
    const customer = await Customer.findByPk(customerId, {
      attributes: ['id', 'balance'],
      rejectOnEmpty: new HttpException('Customer balance not found.', 404),
    });

    return await customer.increment('balance', { by: amount, transaction });
  }
}
