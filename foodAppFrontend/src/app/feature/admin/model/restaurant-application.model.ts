export interface RestaurantApplication {
  id?: number;
  restaurantName: string;
  address: string;
  phoneNumber: string;
  cuisine: string;
  imageUrl: string;
  managerUsername: string;
  managerPassword: string;
  managerName: string;
  managerSurname: string;
  managerEmail: string;
  status?: string;
  createdAt?: string;
  adminComment?: string;
}
