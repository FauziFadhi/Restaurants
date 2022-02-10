import 'reflect-metadata';
import { container } from 'tsyringe';
import Customer from '../../models/core/Customer';
import { CustomerBalanceService } from '../../service/customer-balance.service';
import { HttpException } from '../../utils/error';

describe('CustomerBalanceService', () => {
  let customerBalanceService: CustomerBalanceService;

  beforeEach(() => {
    customerBalanceService = container.resolve(CustomerBalanceService);
  });

  it('should throw error when balance not enough', async () => {
    const findByPk = jest.fn().mockResolvedValue({ id: 1, balance: 40 });
    Customer.findByPk = findByPk;

    const decreaseProm = customerBalanceService.decreaseBalance({
      customerId: 1,
      amount: 50,
    });
    await expect(decreaseProm).rejects.toEqual(
      new HttpException('Your balance not enough.', 400),
    );
  });

  it('should success decrement balance', async () => {
    const findByPk = jest.fn().mockImplementation(() => ({
      this: jest.fn().mockResolvedValue({ id: 1, balance: 90 }),
      decrement: jest.fn().mockResolvedValue({ id: 1, balance: 10 }),
    }));
    Customer.findByPk = findByPk;

    const decreaseProm = customerBalanceService.decreaseBalance({
      customerId: 1,
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
    Customer.findByPk = findByPk;

    const increase = customerBalanceService.increaseBalance({
      customerId: 1,
      amount: 80,
    });
    await expect(increase).resolves.toEqual({ id: 1, balance: 100 });
  });

  it('should reject not found balance', async () => {
    const findByPk = jest
      .fn()
      .mockRejectedValue(new HttpException('Customer balance not found.', 404));
    Customer.findByPk = findByPk;

    const increase = customerBalanceService.increaseBalance({
      customerId: 1,
      amount: 80,
    });

    await expect(increase).rejects.toEqual(
      new HttpException('Customer balance not found.', 404),
    );
  });

  it('should reject not found balance', async () => {
    const findByPk = jest
      .fn()
      .mockRejectedValue(new HttpException('Customer balance not found.', 404));
    Customer.findByPk = findByPk;

    const increase = customerBalanceService.decreaseBalance({
      customerId: 1,
      amount: 80,
    });

    await expect(increase).rejects.toEqual(
      new HttpException('Customer balance not found.', 404),
    );
  });
});
