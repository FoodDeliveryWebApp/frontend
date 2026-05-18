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
  ratingId: number;
  managerId?: number;
  reason: string;
  status?: string;
  createdAt?: string;
  ratingValue?: number;
  ratingComment?: string;
  restaurantId?: number;
}
