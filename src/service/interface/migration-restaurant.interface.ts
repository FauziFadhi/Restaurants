export interface IRestaurantMenuRaw {
  dishName: string;
  price: number;
}

export enum Day {
  Sun = 1,
  Mon,
  Tues,
  Weds,
  Thurs,
  Fri,
  Sat,
  Thu = 5,
}

export interface IRestaurantRaw {
  cashBalance: number;
  openingHours: string;
  restaurantName: string;
  menu: IRestaurantMenuRaw[];
}
