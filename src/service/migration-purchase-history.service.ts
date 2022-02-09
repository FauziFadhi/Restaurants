import Customer from '@models/core/Customer';
import axios from 'axios';
import { parse } from 'date-fns';
import { readFileSync } from 'fs';
import { Transaction } from 'sequelize/types';
import { elasticClient } from '../config/elastic.config';
import { CONST } from '../utils/constant';
import { ArrayToBulkElasticCreateDTO } from '../utils/helpers';
import {
  IDish,
  IMappedDish,
  IMappedRestaurant,
  IMappesRestaurantData,
  IPurchaseHistoryDetails,
  IPurchaseHistoryDTO,
  IPurchaseHistoryRaw,
  IPurchaseHistoryRawData,
} from './interface/migration-purchase-history.interface';

export class MigrationPurchaseHistoryService {
  /**
   * used for migrations
   * migrate purchaseHistory raw data to database and make relation to restaurant table
   */
  async migrate(transaction?: Transaction) {
    const [purchaseHistoriesRaw, mappedRestaurant] = await Promise.all([
      this.retrievePurchaseHistoryRaw(),
      this.getMappedRestaurantData(),
    ]);

    const purchaseHistories: IPurchaseHistoryDTO[] = [];
    const customerDTO = this.iteratePurchaseHistoryRaw(
      purchaseHistoriesRaw,
      mappedRestaurant,
      (_, purchaseHistoriesDTO) => {
        purchaseHistories.push(...purchaseHistoriesDTO);
      },
    );

    await Promise.all([
      /** add elasticsearch */
      elasticClient.bulk({
        index: CONST.ELASTIC.INDEX_PURCHASE_HISTORY,
        body: ArrayToBulkElasticCreateDTO(
          CONST.ELASTIC.INDEX_PURCHASE_HISTORY,
          purchaseHistories,
        ),
      }),
      /** add customer */
      Customer.bulkCreate(customerDTO, {
        transaction,
        include: [
          {
            association: 'purchaseHistories',
            include: [{ association: 'details' }],
          },
        ],
      }),
    ]);
  }

  private iteratePurchaseHistoryRaw(
    purchaseHistoriesRaw: IPurchaseHistoryRawData[],
    mappedRestaurant: IMappedRestaurant,
    callback?: (
      customerDTO: any,
      purchaseHistoriesDTO: IPurchaseHistoryDTO[],
    ) => void,
  ) {
    return purchaseHistoriesRaw.map(({ purchaseHistory, ...customerData }) => {
      const { name, cashBalance: balance } = customerData;
      const customer = {
        name: name,
        balance,
      };
      const purchaseHistories = this.mapPurchaseHistory(
        mappedRestaurant,
        purchaseHistory,
      );
      callback(customer, purchaseHistories);

      return {
        ...customer,
        purchaseHistories,
      };
    });
  }

  /**
   * map raw history to history table object
   * @param restaurantData
   * @param purchaseHistories
   * @param customerId
   * @returns
   */
  private mapPurchaseHistory(
    restaurantData: IMappedRestaurant,
    purchaseHistories: IPurchaseHistoryRaw[],
  ): IPurchaseHistoryDTO[] {
    return purchaseHistories.map((history): IPurchaseHistoryDTO => {
      const restaurant = restaurantData[history.restaurantName];
      return {
        restaurantName: history.restaurantName,
        restaurantId: restaurant?.id,
        amount: history.transactionAmount,
        date: parse(history.transactionDate, 'MM/dd/yyyy hh:mm a', new Date()),
        details: this.mapPurchaseHistoryDetails(history, restaurant),
      };
    });
  }

  /**
   * map raw history details to historyDetails table object
   * @param purchaseHistory
   * @param restaurantData
   * @returns
   */
  private mapPurchaseHistoryDetails(
    purchaseHistory: IPurchaseHistoryRaw,
    restaurantData: IMappesRestaurantData,
  ): IPurchaseHistoryDetails[] {
    const dish = restaurantData?.dishes[purchaseHistory.dishName];
    return [
      {
        amount: purchaseHistory.transactionAmount,
        dishId: dish?.id,
        dishName: purchaseHistory.dishName,
        restaurantId: restaurantData?.id,
      },
    ];
  }

  /**
   * get raw data from links git
   * @returns {IPurchaseHistoryRawData}
   */
  private async retrievePurchaseHistoryRaw(): Promise<
    IPurchaseHistoryRawData[]
  > {
    const purchaseHistoryRsp = await axios.get<IPurchaseHistoryRawData[]>(
      'https://gist.githubusercontent.com/seahyc/de33162db680c3d595e955752178d57d/raw/785007bc91c543f847b87d705499e86e16961379/users_with_purchase_history.json',
    );

    return purchaseHistoryRsp.data;
  }

  /**
   * map restaurant list of array to object and make restaurantName become the key of objects
   *
   */
  private async getMappedRestaurantData(): Promise<IMappedRestaurant> {
    const restaurantFile = readFileSync('restaurants.json');

    const restaurantJSON = JSON.parse(restaurantFile as any);

    const mappedRestaurant = {};

    restaurantJSON.forEach((rest) => {
      const mappedDish = this.getMappedDish(rest.dishes);

      mappedRestaurant[rest.name] = {
        id: rest.id,
        balance: rest.balance,
        dishes: mappedDish,
      };
    });

    return mappedRestaurant;
  }

  /**
   * map dishes list of array to object and make dishName become the key of objects
   * @param dishes
   * @returns
   */
  private getMappedDish(dishes: IDish[]): IMappedDish {
    const mappedDish = {};

    dishes.forEach((dish) => {
      mappedDish[dish.name] = {
        id: dish.id,
        price: dish.price,
      };
    });

    return mappedDish;
  }
}
