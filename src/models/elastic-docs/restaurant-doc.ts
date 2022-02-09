import { CONST } from '@utils/constant';
import { format } from 'date-fns';
import { Client, SearchParams, SearchResponse } from 'elasticsearch';
import { elasticClient } from '../../config/elastic.config';

interface IBuiltQuery {
  [field: string]: any;
  query: {
    [field: string]: any;
    bool: {
      [field: string]: any;
      must: any[];
    };
  };
}

export interface IRestaurant {
  id: string;
  name: string;
  balance?: string;
  dishes?: IRestaurantDishes[];
  schedules?: IRestaurantSchedules[];
}

export interface IRestaurantDishes {
  id: number;
  name: string;
  price: number;
}

export interface IRestaurantSchedules {
  id: number;
  day: number;
  dayStr: string;

  /** HH:mm:ss */
  startTime: string;
  /** HH:mm:ss */
  endTime: string;
}

export interface Options {
  search?: string;
  name?: string;
  size?: number;
  dishName?: string;
  dishMaxPrice?: number;
  dishMinPrice?: number;
  isOpen?: boolean;
  openAt?: Date;
}

export class RestaurantDoc {
  static elasticClient: Client = elasticClient;

  static async search<IRestaurant>(
    options: Options,
    customQuery?: SearchParams,
  ): Promise<SearchResponse<IRestaurant>>;
  static async search<IRestaurant>(
    params: SearchParams,
  ): Promise<SearchResponse<IRestaurant>>;
  static async search(...options: any[]) {
    const index = CONST.ELASTIC.INDEX_RESTAURANT;
    if (options[0].body) {
      return RestaurantDoc.elasticClient.search({
        ...options[0],
        index,
      });
    }

    const {
      search,
      name,
      dishName,
      isOpen,
      openAt,
      dishMinPrice,
      size,
      dishMaxPrice,
    } = options[0];

    const builtQuery: IBuiltQuery = {
      ...options[1],
      size,
      query: {
        bool: {
          must: [],
        },
      },
    };
    if (isOpen || openAt) {
      RestaurantDoc.searchBySchedule(builtQuery, openAt);
    }
    if (dishMaxPrice || dishMinPrice || dishName)
      RestaurantDoc.searchByDish(builtQuery, {
        maxPrice: dishMaxPrice,
        minPrice: dishMinPrice,
        dishName,
      });
    if (search) {
      RestaurantDoc.searchText(builtQuery, search);
    } else if (name) {
      RestaurantDoc.searchByName(builtQuery, name);
    } else if (dishName) {
      RestaurantDoc.searchByDishName(builtQuery, dishName);
    }
    console.log(JSON.stringify(builtQuery.query.bool.must));

    return RestaurantDoc.elasticClient.search({
      index,
      body: builtQuery,
    });
  }

  static async searchDish({ name }: { name: string }) {
    const restaurantDocs = await this.elasticClient.search({
      index: CONST.ELASTIC.INDEX_RESTAURANT,
      body: {
        query: {
          nested: {
            inner_hits: {},
            path: 'dishes',
            query: {
              match: {
                'dishes.name': name,
              },
            },
          },
        },
      },
    });

    const dishes = [];
    restaurantDocs.hits.hits.forEach((restaurantDoc) => {
      dishes.push(...restaurantDoc.inner_hits['dishes'].hits.hits);
    });

    return dishes;
  }

  static async findById(id: string) {
    return this.elasticClient.get<IRestaurant>({
      id,
      index: CONST.ELASTIC.INDEX_RESTAURANT,
      type: '_doc',
    });
  }

  private static searchByDishName(builtQuery: IBuiltQuery, text: string) {
    builtQuery.query.bool.must.push({
      match: {
        'dish.name': text,
      },
    });
  }

  private static searchBySchedule(builtQuery: IBuiltQuery, dateTime?: Date) {
    console.log(dateTime);
    const date = dateTime || new Date();
    console.log(date);
    const day = date.getDay() + 1;
    const time = format(date, 'HH:mm:ss');
    builtQuery.query.bool.must.push({
      nested: {
        path: 'schedules',
        query: {
          bool: {
            must: [
              {
                range: {
                  'schedules.startTime': {
                    lte: time,
                  },
                },
              },
              {
                range: {
                  'schedules.endTime': {
                    gte: time,
                  },
                },
              },
              {
                match: {
                  'schedules.day': day,
                },
              },
            ],
          },
        },
      },
    });
  }

  private static searchText(builtQuery: IBuiltQuery, text: string) {
    this.searchByDishName(builtQuery, text);
    this.searchByName(builtQuery, text);
  }

  private static searchByDish(
    builtQuery: IBuiltQuery,
    {
      minPrice,
      maxPrice,
      dishName,
    }: { minPrice: string; maxPrice: string; dishName: string },
  ) {
    const query = [];
    if (dishName) {
      query.push({
        match: {
          'dishes.name': dishName,
        },
      });
    }

    if (minPrice || maxPrice) {
      query.push({
        range: {
          'dishes.price': {
            ...(Number.isInteger(+maxPrice) && { lte: maxPrice }),
            ...(Number.isInteger(+minPrice) && { gte: minPrice }),
          },
        },
      });
    }
    builtQuery.query.bool.must.push({
      nested: {
        path: 'dishes',
        query: {
          bool: {
            must: query,
          },
        },
      },
    });
  }
  private static searchByName(builtQuery: IBuiltQuery, text: string) {
    builtQuery.query.bool.must.push({
      match: {
        name: text,
      },
    });
  }
}
