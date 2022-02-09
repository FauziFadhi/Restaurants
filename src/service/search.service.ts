import { elasticClient } from '@config/elastic.config';
import { CONST } from '@utils/constant';
import { HttpException } from '@utils/error';
import { elasticDocToObj } from '@utils/helpers';
import { autoInjectable } from 'tsyringe';

const RESTAURANT_OR_DISH = 'restaurant-or-dish';
const LIST_TYPE = [RESTAURANT_OR_DISH] as const;
type SearchType = typeof LIST_TYPE[number];

@autoInjectable()
export class SearchService {
  /**
   * find list of restaurants based on provided filter
   * @param param0
   * @returns
   */
  async search(type: SearchType, query: { name: string }) {
    switch (type) {
      case RESTAURANT_OR_DISH:
        return this.searchRestaurantOrDish(query);
      default:
        throw new HttpException('Type of search not recognized.', 400);
    }
  }

  private async searchRestaurantOrDish({ name }: { name: string }) {
    if (!name)
      throw new HttpException(
        'query name should provided for this type of search.',
        400,
      );
    const { INDEX_DISHES, INDEX_RESTAURANT } = CONST.ELASTIC;
    const restaurantOrDishDocs = await elasticClient.search({
      index: `${INDEX_DISHES},${INDEX_RESTAURANT}`,
      body: {
        query: {
          match_phrase: {
            name,
          },
        },
        _source: {
          excludes: ['dishes', 'schedules'],
        },
      },
    });

    return elasticDocToObj(restaurantOrDishDocs, [
      INDEX_DISHES,
      INDEX_RESTAURANT,
    ]);
  }
}
