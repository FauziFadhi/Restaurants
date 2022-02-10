import Customer from '@models/core/Customer';
import PurchaseHistory from '@models/core/PurchaseHistory';
import Restaurant from '@models/core/Restaurant';
import RestaurantDish from '@models/core/RestaurantDish';
import { HttpException } from '@utils/error';
import 'reflect-metadata';
import { container } from 'tsyringe';
import { CustomerBalanceService } from '../../service/customer-balance.service';
import { PurchaseService } from '../../service/purchase.service';
import { RestaurantBalanceService } from '../../service/restaurant-balance.service';

describe('PurchaseService', () => {
  let purchaseService: PurchaseService;

  describe('purchase', () => {
    beforeEach(() => {
      container.register(CustomerBalanceService, {
        useValue: {
          decreaseBalance: jest.fn().mockResolvedValue({ id: 1, balance: 20 }),
          increaseBalance: jest.fn().mockResolvedValue({ id: 1, balance: 20 }),
        },
      });
      container.register(RestaurantBalanceService, {
        useValue: {
          decreaseBalance: jest.fn().mockResolvedValue({ id: 1, balance: 20 }),
          increaseBalance: jest.fn().mockResolvedValue({ id: 1, balance: 20 }),
        },
      });

      purchaseService = container.resolve(PurchaseService);
    });

    it('should success purchase', async () => {
      const findByPkRes = jest.fn().mockImplementation(() => ({
        this: jest.fn().mockResolvedValue({ id: 1, name: 'Pizza Restaurant' }),
        toJSON: jest.fn().mockReturnValue({ id: 1, name: 'Pizza Restaurant' }),
      }));
      Restaurant.findByPk = findByPkRes;

      const findByPkCustomer = jest
        .fn()
        .mockResolvedValue({ id: 1, name: 'Brian' });
      Customer.findByPk = findByPkCustomer;

      const findByPkDish = jest
        .fn()
        .mockResolvedValue({ id: 1, name: 'Pizza Carbonara', price: 10 });
      RestaurantDish.findOne = findByPkDish;

      const date = new Date();
      jest.spyOn(purchaseService, 'storePurchase').mockResolvedValue({
        totalAmount: 100,
        purchase: PurchaseHistory.build({
          restaurantId: 1,
          restaurantName: 'Pizza Restaurant',
          customerId: 1,
          date,
          amount: 100,
        }),
      });

      const purchase = purchaseService.purchase({
        dishId: 1,
        customerId: 1,
        restaurantId: 1,
      });

      await expect(purchase).resolves.toEqual({
        restaurant: {
          id: 1,
          name: 'Pizza Restaurant',
          dishes: [{ id: 1, name: 'Pizza Carbonara', price: 10 }],
        },
        date,
        totalAmount: 100,
      });
    });

    it('should throw error if dishes not found', async () => {
      const error = new HttpException('Dish not Found.', 400);

      const findByPkDish = jest.fn().mockRejectedValue(error);
      RestaurantDish.findOne = findByPkDish;

      const findByPkCustomer = jest
        .fn()
        .mockResolvedValue({ id: 1, name: 'Brian' });
      Customer.findByPk = findByPkCustomer;

      const findByPkRes = jest
        .fn()
        .mockResolvedValue({ id: 1, name: 'Pizza Restaurant' });
      Restaurant.findByPk = findByPkRes;

      const purchase = purchaseService.purchase({
        dishId: 1,
        customerId: 1,
        restaurantId: 1,
      });

      await expect(purchase).rejects.toEqual(error);
    });

    it('should throw error if restaurant not found', async () => {
      const error = new HttpException('Restaurant Not Found.', 400);

      const findByPkCustomer = jest
        .fn()
        .mockResolvedValue({ id: 1, name: 'Brian' });
      Customer.findByPk = findByPkCustomer;

      const findByPkDish = jest
        .fn()
        .mockResolvedValue({ id: 1, name: 'Pizza Carbonara', price: 10 });
      RestaurantDish.findOne = findByPkDish;

      const findByPkRes = jest.fn().mockRejectedValue(error);
      Restaurant.findByPk = findByPkRes;

      const purchase = purchaseService.purchase({
        dishId: 1,
        customerId: 1,
        restaurantId: 1,
      });

      await expect(purchase).rejects.toEqual(error);
    });
  });

  describe('storePurchase', () => {
    beforeEach(() => {
      purchaseService = container.resolve(PurchaseService);
    });

    it('should success storing purchase data', async () => {
      const date = new Date();
      const createMock = jest.fn().mockResolvedValue(
        PurchaseHistory.build({
          id: 1,
          restaurantId: 1,
          restaurantName: 'Pizza Restaurant',
          customerId: 1,
          amount: 20,
          date: date,
        } as any),
      );
      PurchaseHistory.create = createMock;

      const storePurchase = purchaseService.storePurchase({
        restaurant: {
          id: 1,
          name: 'Pizza Restaurant',
        },
        dishes: [
          {
            id: 1,
            name: 'Pizza',
            price: 10,
          },
          {
            id: 1,
            name: 'Pizza Carbonara',
            price: 10,
          },
        ],
        customerId: 1,
      });

      await expect(storePurchase).resolves.toEqual({
        totalAmount: 20,
        purchase: PurchaseHistory.build({
          id: 1,
          restaurantId: 1,
          restaurantName: 'Pizza Restaurant',
          customerId: 1,
          amount: 20,
          date: date,
        } as any),
      });
    });
  });
});
