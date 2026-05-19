import { Food } from '../../restaurant/model/food.model';

export interface Order {
  id: number;
  userId: number;
  foods: Food[];
  orderTime: string;
  status: string;
  totalPrice: number;
  deliveryPrice: number;
  deliveryManId?: number;
  note: string;
  deliveryAddress: string;
  phoneNumber: string;
}

export interface OrderCreate {
  userId: number;
  foods: Food[];
  note: string;
  status: string;
  deliveryAddress: string;
  phoneNumber: string;
}

export interface ManagerEarnings {
  orders: Order[];
  totalEarnings: number;
}

export interface DeliveryManEarnings {
  orders: Order[];
  totalEarnings: number;
}
