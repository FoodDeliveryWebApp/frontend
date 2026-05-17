export interface Restaurant {
  id: number;
  name: string;
  address: string;
  phoneNumber: string;
  isActive: boolean;
  cuisine: string;
  imageUrl: string;
  manager?: { username: string; role: string; isActive: boolean };
}

export interface RestaurantCreate {
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
}

export interface WorkerCreate {
  username: string;
  password: string;
  role: string;
  isActive: boolean;
  name: string;
  surname: string;
  email: string;
}

export interface Worker {
  id: number;
  username: string;
  isActive: boolean;
  role: string;
  name?: string;
  surname?: string;
  email?: string;
}
