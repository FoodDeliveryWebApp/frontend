import { Food } from '../../restaurant/model/food.model';

export interface Order {
  id: number;
  userId: number;
  foods: Food[];
  orderTime: string;
  status: string;
  totalPrice: number;
  note: string;
}

export interface OrderCreate {
  userId: number;
  foods: { id: number }[];
  note: string;
  status: string;
}

export interface ManagerEarnings {
  orders: Order[];
  totalEarnings: number;
}
