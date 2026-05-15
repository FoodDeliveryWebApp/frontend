import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DecimalPipe } from '@angular/common';
import { environment } from 'src/env/environment';
import { RestaurantService } from '../services/restaurant.service';
import { OrderService } from '../../order/services/order.service';
import { RatingService } from '../../rating/services/rating.service';
import { AuthService } from '../../../infrastructure/auth/auth.service';
import { Restaurant } from '../model/restaurant.model';
import { Food } from '../model/food.model';
import { RestaurantRating } from '../../rating/model/restaurant-rating.model';

@Component({
  selector: 'app-restaurant-detail',
  standalone: true,
  imports: [FormsModule, MatCardModule, MatButtonModule, MatIconModule, MatDividerModule, MatProgressSpinnerModule, MatFormFieldModule, MatInputModule, DecimalPipe],
  templateUrl: './restaurant-detail.component.html',
  styleUrl: './restaurant-detail.component.css'
})
export class RestaurantDetailComponent implements OnInit {
  restaurant: Restaurant | null = null;
  foods: Food[] = [];
  cart: Food[] = [];
  orderNote = '';
  loading = true;
  ordering = false;

  showRatingForm = false;
  ratingValue = 5;
  ratingComment = '';

  ratings: RestaurantRating[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private restaurantService: RestaurantService,
    private orderService: OrderService,
    private ratingService: RatingService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  private backendHost = environment.apiHost.replace('api/', '');

  getImageUrl(path: string): string {
    return this.backendHost + path;
  }

  get restaurantId(): number {
    return +this.route.snapshot.paramMap.get('id')!;
  }

  get user() { return this.authService.user$.getValue(); }
  get isGuest(): boolean { return this.user.role?.toLowerCase() === 'guest'; }
  get cartTotal(): number { return this.cart.reduce((s, f) => s + f.price, 0); }

  ngOnInit(): void {
    this.restaurantService.getAll().subscribe(list => {
      this.restaurant = list.find(r => r.id === this.restaurantId) ?? null;
    });
    this.restaurantService.getFoodsByRestaurant(this.restaurantId).subscribe({
      next: (foods) => { this.foods = foods; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  addToCart(food: Food): void { this.cart.push(food); }

  removeFromCart(index: number): void { this.cart.splice(index, 1); }

  cartCount(foodId: number): number {
    return this.cart.filter(f => f.id === foodId).length;
  }

  placeOrder(): void {
    if (!this.user.username) {
      this.router.navigate(['/login']);
      return;
    }
    if (this.cart.length === 0) {
      this.snackBar.open('Add items to cart first', 'Close', { duration: 2000 });
      return;
    }
    this.ordering = true;
    this.orderService.createOrder({
      userId: this.user.id,
      foods: this.cart.map(f => ({ id: f.id })),
      note: this.orderNote,
      status: 'Pending'
    }).subscribe({
      next: () => {
        this.ordering = false;
        this.cart = [];
        this.orderNote = '';
        this.snackBar.open('Order placed successfully!', 'Close', { duration: 3000 });
      },
      error: () => {
        this.ordering = false;
        this.snackBar.open('Failed to place order', 'Close', { duration: 3000 });
      }
    });
  }

  submitRating(): void {
    const rating: RestaurantRating = {
      rating: this.ratingValue,
      comment: this.ratingComment,
      ratedByUserId: this.user.id,
      restaurantId: this.restaurantId
    };
    this.ratingService.addRating(rating).subscribe({
      next: () => {
        this.showRatingForm = false;
        this.ratingComment = '';
        this.snackBar.open('Rating submitted!', 'Close', { duration: 3000 });
      },
      error: () => { this.snackBar.open('Failed to submit rating', 'Close', { duration: 3000 }); }
    });
  }
}
