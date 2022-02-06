import axios from 'axios';
import { format, parse } from 'date-fns';
import { writeFileSync } from 'fs';
import { Transaction } from 'sequelize/types';
import { elasticClient } from '../../config/elastic.config';
import { Migration } from '../../config/migration.config';
import Restaurant from '../../models/Restaurant';
import RestaurantDish from '../../models/RestaurantDish';
import RestaurantSchedule from '../../models/RestaurantSchedule';

export const databasePath = __dirname;

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.sequelize.transaction(async (transaction) => {

    const resp = await axios.get<IRestaurantRaw[]>('https://gist.githubusercontent.com/seahyc/b9ebbe264f8633a1bf167cc6a90d4b57/raw/021d2e0d2c56217bad524119d1c31419b2938505/restaurant_with_menu.json')

    const restaurants = await insertRestaurantData(resp.data, transaction)
    writeFileSync('restaurants.json', JSON.stringify(restaurants))
    const elasticRestaurants = [] 
    restaurants.forEach((data) => {
      elasticRestaurants.push({
        index: {_index: 'restaurants'}
      }, data)
    })

    await elasticClient.bulk({
      index: 'restaurants',
      body: elasticRestaurants,
    })
  });
};
export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.sequelize.transaction(async (transaction) => {
    
    await Promise.all([
      RestaurantDish.truncate({force: true, restartIdentity: true, cascade: true}),
      RestaurantSchedule.truncate({force: true, restartIdentity: true, cascade: true})
    ])
    await Restaurant.truncate({force: true, restartIdentity: true, cascade: true})
  });
};

interface IRestaurantMenuRaw {
  dishName: string
  price: number
}

interface IRestaurantRaw {
  cashBalance: number
  openingHours: string
  restaurantName: string
  menu: IRestaurantMenuRaw[]
}

const insertRestaurantData = async (restaurantRaw: IRestaurantRaw[], transaction: Transaction) => {
    const restaurantsDTO = restaurantRaw.map((restaurant => {
      return {
        name: restaurant.restaurantName,
        balance: restaurant.cashBalance,
        dishes: restaurant.menu.map((dish) => ({name: dish.dishName, price: dish.price})),
        schedules: mapRestaurantSchedule(restaurant.openingHours), 
      }
    }))

    const restaurants = await Restaurant.bulkCreate(restaurantsDTO, {
      transaction,
      returning: ['id','balance', 'name'],
      include: [{
        association: 'dishes',
        attributes: ['name', 'price', 'id'],
      },
      {
        association: 'schedules',
        attributes: ['id', 'day', 'startTime', 'endTime']
      }]
    })

    return restaurants.map((res) => ({
      id: res.id,
      name: res.name,
      balance: res.balance,
      dishes: res.dishes.map((dish) => ({
        id: dish.id,
        name: dish.name,
        price: dish.price,
      })),
      schedules: res.schedules.map((schedule) => ({
        id: schedule.id,
        day: schedule.day,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        dayStr: Day[schedule.day],
      })),
    }))
}

enum Day {
  Sun = 1,
  Mon,
  Tues,
  Weds,
  Thurs,
  Fri,
  Sat,
  Thu = 5,
}
const mapRestaurantSchedule = (restaurantOpeningHours: string) => {
  const schedulesRaw = restaurantOpeningHours.split('/');

  const schedules: any[] = []
  schedulesRaw.forEach((schedule, index) => {
    const indexFirstNum = schedule.search(/\d/)
    const daysStr = schedule.substr(0, indexFirstNum);
    const timeStr = schedule.substr(indexFirstNum);
    const [startTime, endTime] = getTime(timeStr)
    getDate(daysStr, (day) => {
      schedules.push({
        day,
        endTime,
        startTime,
      })
    })
  })

  return schedules
}

const getDate = (dayStr: string, callback?: (day: string) => void) => {
  dayStr.split(',').forEach((d) => {
    const day = d.trim()
    if(day.includes('-')) {
        const [startDay, endDay] = day.split('-').map((ds) => ds.trim())
        const startDayNum = Day[`${startDay}`]
        const endDayNum = Day[`${endDay}`]
        for (let index = startDayNum; index <= endDayNum; index= index + 1) {
          callback(index || null)
        }
      } else {
        day.split(',').forEach((dayString) => {
          const day: any = dayString.trim()
          
          callback(Day[day] || null)
        })
      }
  })
}

const getTime = (timeStr: string): [string, string] => {
  const [startTime, endTime] = timeStr.split('-').map(time => {
    const tStr = time.trim()
    const timeLength = tStr.length
    
    if(timeLength == 4 || timeLength == 5) {
      const newTime = parse(tStr, 'h a', new Date())
      return format(newTime, 'hh:mm a')
    }
   
    return tStr
  })

  return [startTime, endTime]
}
