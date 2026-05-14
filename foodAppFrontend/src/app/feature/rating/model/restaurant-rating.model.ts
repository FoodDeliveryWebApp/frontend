export interface RestaurantRating {
  id?: number;
  rating: number;
  comment: string;
  ratedByUserId: number;
  restaurantId: number;
  createdAt?: string;
}

export interface RatingReport {
  id?: number;
  orderId: number;
  managerId: number;
  comment: string;
  status?: string;
  createdAt?: string;
}
