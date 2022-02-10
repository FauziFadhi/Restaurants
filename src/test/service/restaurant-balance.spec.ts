import Restaurant from '@models/core/Restaurant';
import 'reflect-metadata';
import { container } from 'tsyringe';
import Customer from '../../models/core/Customer';
import { RestaurantBalanceService } from '../../service/restaurant-balance.service';
import { HttpException } from '../../utils/error';

describe('RestaurantBalanceService', () => {
  let restaurantBalanceService: RestaurantBalanceService;

  beforeEach(() => {
    restaurantBalanceService = container.resolve(RestaurantBalanceService);
  });

  it('should throw error when balance not enough', async () => {
    const findByPk = jest.fn().mockResolvedValue({ id: 1, balance: 40 });
    Restaurant.findByPk = findByPk;

    const decreaseProm = restaurantBalanceService.decreaseBalance({
      restaurantId: 1,
      amount: 50,
    });
    await expect(decreaseProm).rejects.toEqual(
      new HttpException('Your restaurant balance not enough.', 400),
    );
  });

  it('should success decrement balance', async () => {
    const findByPk = jest.fn().mockImplementation(() => ({
      this: jest.fn().mockResolvedValue({ id: 1, balance: 90 }),
      decrement: jest.fn().mockResolvedValue({ id: 1, balance: 10 }),
    }));
    Restaurant.findByPk = findByPk;

    const decreaseProm = restaurantBalanceService.decreaseBalance({
      restaurantId: 1,
      amount: 80,
    });
    await decreaseProm;
    try {
      await expect(decreaseProm).resolves.toEqual({ id: 1, balance: 10 });
    } catch (e) {
      console.log(e);
      throw e;
    }
  });

  it('should increase balance', async () => {
    const findByPk = jest.fn().mockImplementation(() => ({
      this: jest.fn().mockResolvedValue({ id: 1, balance: 90 }),
      increment: jest.fn().mockResolvedValue({ id: 1, balance: 100 }),
    }));
    Restaurant.findByPk = findByPk;

    const increase = restaurantBalanceService.increaseBalance({
      restaurantId: 1,
      amount: 80,
    });
    await expect(increase).resolves.toEqual({ id: 1, balance: 100 });
  });

  it('should reject not found balance', async () => {
    const findByPk = jest
      .fn()
      .mockRejectedValue(
        new HttpException('Restaurant balance not found.', 404),
      );
    Restaurant.findByPk = findByPk;

    const increase = restaurantBalanceService.increaseBalance({
      restaurantId: 1,
      amount: 80,
    });

    await expect(increase).rejects.toEqual(
      new HttpException('Restaurant balance not found.', 404),
    );
  });

  it('should reject not found balance', async () => {
    const findByPk = jest
      .fn()
      .mockRejectedValue(
        new HttpException('Restaurant balance not found.', 404),
      );
    Customer.findByPk = findByPk;

    const increase = restaurantBalanceService.decreaseBalance({
      restaurantId: 1,
      amount: 80,
    });

    await expect(increase).rejects.toEqual(
      new HttpException('Restaurant balance not found.', 404),
    );
  });
});
