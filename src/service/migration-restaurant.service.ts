import Restaurant from '@models/core/Restaurant';
import { CONST } from '@utils/constant';
import axios from 'axios';
import { format, parse } from 'date-fns';
import { writeFileSync } from 'fs';
import { Transaction } from 'sequelize/types';
import { elasticClient } from '../config/elastic.config';
import { ArrayToBulkElasticCreateDTO } from '../utils/helpers';
import {
  Day,
  IRestaurantRaw,
} from './interface/migration-restaurant.interface';

export class MigrationRestaurantService {
  async migrate(transaction?: Transaction) {
    const resp = await axios.get<IRestaurantRaw[]>(
      'https://gist.githubusercontent.com/seahyc/b9ebbe264f8633a1bf167cc6a90d4b57/raw/021d2e0d2c56217bad524119d1c31419b2938505/restaurant_with_menu.json',
    );

    const { INDEX_DISHES, INDEX_RESTAURANT } = CONST.ELASTIC;

    const { restaurants, dishes } = await this.insertRestaurantData(
      resp.data,
      transaction,
    );
    writeFileSync('restaurants.json', JSON.stringify(restaurants));
    const elasticRestaurantsDTO = ArrayToBulkElasticCreateDTO(
      INDEX_RESTAURANT,
      restaurants,
    );

    const elasticDishesDTO = ArrayToBulkElasticCreateDTO(INDEX_DISHES, dishes);

    await Promise.all([
      elasticClient.bulk({
        index: INDEX_DISHES,
        body: elasticDishesDTO,
      }),
      elasticClient.bulk({
        index: INDEX_RESTAURANT,
        body: elasticRestaurantsDTO,
      }),
    ]);
  }
  /**
   *
   * @param restaurantRaw
   * @param transaction
   * @returns
   */
  private async insertRestaurantData(
    restaurantRaw: IRestaurantRaw[],
    transaction: Transaction,
  ) {
    const restaurantsDTO = restaurantRaw.map((restaurant) => {
      return {
        name: restaurant.restaurantName,
        balance: restaurant.cashBalance,
        dishes: restaurant.menu.map((dish) => ({
          name: dish.dishName,
          price: dish.price,
        })),
        schedules: this.mapRestaurantSchedule(restaurant.openingHours),
      };
    });

    const restaurants = await Restaurant.bulkCreate(restaurantsDTO, {
      transaction,
      include: [
        {
          association: 'dishes',
        },
        {
          association: 'schedules',
        },
      ],
    });

    const dishes = [];

    const mappedRestaurants = restaurants.map((res) => {
      const disheList = res.dishes.map((dish) => ({
        id: dish.id,
        name: dish.name,
        price: dish.price,
      }));
      dishes.push(...disheList);

      const schedules = res.schedules.map((schedule) => ({
        id: schedule.id,
        day: schedule.day,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        dayStr: Day[schedule.day],
      }));

      return {
        id: res.id,
        name: res.name,
        balance: res.balance,
        dishes: disheList,
        schedules,
      };
    });

    return {
      restaurants: mappedRestaurants,
      dishes,
    };
  }

  /**
   * map sentence schedule of restaurant to list of schedule
   * @param restaurantOpeningHours
   * @returns
   */
  mapRestaurantSchedule(restaurantOpeningHours: string) {
    const schedulesRaw = restaurantOpeningHours.split('/');

    const schedules: any[] = [];
    schedulesRaw.forEach((schedule) => {
      const indexFirstNum = schedule.search(/\d/);
      const daysStr = schedule.substr(0, indexFirstNum);
      const timeStr = schedule.substr(indexFirstNum);
      const [startTime, endTime] = this.getTime(timeStr);
      this.getDate(daysStr, (day) => {
        schedules.push({
          day,
          endTime,
          startTime,
        });
      });
    });

    return schedules;
  }

  /**
   * transform sentence date to proper date
   * @param dayStr
   * @param callback
   */
  getDate(dayStr: string, callback?: (day: string) => void) {
    dayStr.split(',').forEach((d) => {
      const day = d.trim();

      if (day.includes('-')) {
        const [startDay, endDay] = day.split('-').map((ds) => ds.trim());
        const startDayNum = Day[`${startDay}`];
        const endDayNum = Day[`${endDay}`];
        for (let index = startDayNum; index <= endDayNum; index = index + 1) {
          callback(index || null);
        }
      } else {
        day.split(',').forEach((dayString) => {
          const day: any = dayString.trim();

          callback(Day[day] || null);
        });
      }
    });
  }

  /**
   * transform sentence time to proper time
   * @param timeStr
   * @returns
   */
  getTime(timeStr: string): [string, string] {
    const [startTime, endTime] = timeStr.split('-').map((time) => {
      const tStr = time.trim();
      const timeLength = tStr.length;

      if (timeLength == 4 || timeLength == 5) {
        const newTime = parse(tStr, 'h a', new Date());
        return format(newTime, 'hh:mm a');
      }

      return tStr;
    });

    return [startTime, endTime];
  }
}
