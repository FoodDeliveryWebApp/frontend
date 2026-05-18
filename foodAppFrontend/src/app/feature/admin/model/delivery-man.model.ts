export interface DeliveryMan {
  id: number;
  username: string;
  password?: string;
  name?: string;
  surname?: string;
  email?: string;
  isActive: boolean;
  role?: string;
}
