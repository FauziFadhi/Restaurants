export interface IDish {
  id: number;
  name: string;
  price: number;
}

export interface IMappedDish {
  [name: string]: IMappedDishData
}

export interface IMappedDishData extends Omit<IDish, 'name'> {

}
export interface IMappedRestaurant {
  [name: string]: IMappesRestaurantData
}

export interface IMappesRestaurantData {
  id: number;
  balance: number;
  dishes: IMappedDish
}

export interface ICustomerRaw {
  cashBalance: number
  id: number;
  name: string;
}

export interface IPurchaseHistoryRaw {
  dishName: string;
  restaurantName: string;
  transactionAmount: number;
  /** MM/DD/YYYY hh:mm A */
  transactionDate: string;
}

export interface IPurchaseHistoryRawData extends ICustomerRaw {
  purchaseHistory: IPurchaseHistoryRaw[]
}

export interface IPurchaseHistoryDTO {
  restaurantId: number;
  restaurantName: string;
  amount: number;
  date: Date;
  details: IPurchaseHistoryDetails[]
}

export interface IPurchaseHistoryDetails {
  restaurantId: number;
  dishId: number;
  dishName: string;
  amount: number;
}

export interface ICustomerDTO {
  id: number;
  name: string;
  balance: number;
}