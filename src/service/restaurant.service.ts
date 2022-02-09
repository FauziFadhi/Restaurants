import { elasticDocToObj } from '@utils/helpers';
import { parse } from 'date-fns';
import { autoInjectable } from 'tsyringe';
import { RestaurantDoc } from '../models/elastic-docs/restaurant-doc';

@autoInjectable()
export class RestaurantService {
  /**
   * find list of restaurants based on provided filter
   * @param param0
   * @returns
   */
  async listRestaurant({
    search,
    openAt,
    isOpen,
    size,
    name,
    dishMaxPrice,
    dishMinPrice,
  }) {
    const restaurantDocs = await RestaurantDoc.search({
      search,
      openAt: openAt && parse(openAt, 'yyyy-MM-dd HH:mm:ss', new Date()),
      isOpen,
      name,
      size,
      dishMaxPrice,
      dishMinPrice,
    });

    return elasticDocToObj(restaurantDocs);
  }

  /**
   * get detail restaurant
   */
  async findById(id: string) {
    const restaurant = await RestaurantDoc.findById(id);

    return elasticDocToObj(restaurant);
  }

  async create() {}
}
