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
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
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
  deliveryAddress = '';
  phoneNumber = '';
  loading = true;
  ordering = false;

  showRatingForm = false;
  ratingValue = 5;
  ratingComment = '';
  averageRating: number | null = null;

  ratings: RestaurantRating[] = [];
  existingRating: RestaurantRating | null = null;
  hasOrderedHere = false;

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
    this.ratingService.getAverageRating(this.restaurantId).subscribe({
      next: (avg) => { this.averageRating = avg; },
      error: () => {}
    });

    if (this.isGuest) {
      forkJoin({
        foods: this.restaurantService.getFoodsByRestaurant(this.restaurantId).pipe(catchError(() => of([] as Food[]))),
        orders: this.orderService.getGuestOrders(this.user.id).pipe(catchError(() => of([]))),
        ratings: this.ratingService.getRatingsForRestaurant(this.restaurantId).pipe(catchError(() => of([])))
      }).subscribe({
        next: ({ foods, orders, ratings }) => {
          this.foods = foods;
          this.loading = false;
          const menuFoodIds = new Set(foods.map(f => f.id));
          this.hasOrderedHere = orders
            .filter(o => o.status?.toLowerCase() === 'delivered')
            .some(o => o.foods.some(f => menuFoodIds.has(f.id) || f.restaurantId === this.restaurantId));
          this.existingRating = ratings.find((r: RestaurantRating) => r.ratedByUserId === this.user.id) ?? null;
          if (this.existingRating) {
            this.ratingValue = this.existingRating.rating;
            this.ratingComment = this.existingRating.comment;
          }
        },
        error: () => { this.loading = false; }
      });
    } else {
      this.restaurantService.getFoodsByRestaurant(this.restaurantId).subscribe({
        next: (foods) => { this.foods = foods; this.loading = false; },
        error: () => { this.loading = false; }
      });
    }
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
    if (!this.deliveryAddress.trim()) {
      this.snackBar.open('Delivery address is required', 'Close', { duration: 2500 });
      return;
    }
    if (!this.phoneNumber.trim()) {
      this.snackBar.open('Phone number is required', 'Close', { duration: 2500 });
      return;
    }
    this.ordering = true;
    this.orderService.createOrder({
      userId: this.user.id,
      foods: this.cart,
      note: this.orderNote,
      status: 'Pending',
      deliveryAddress: this.deliveryAddress.trim(),
      phoneNumber: this.phoneNumber.trim()
    }).subscribe({
      next: () => {
        this.ordering = false;
        this.cart = [];
        this.orderNote = '';
        this.deliveryAddress = '';
        this.phoneNumber = '';
        this.snackBar.open('Order placed successfully!', 'Close', { duration: 3000 });
      },
      error: () => {
        this.ordering = false;
        this.snackBar.open('Failed to place order', 'Close', { duration: 3000 });
      }
    });
  }

  submitRating(): void {
    const payload: RestaurantRating = {
      rating: this.ratingValue,
      comment: this.ratingComment,
      ratedByUserId: this.user.id,
      restaurantId: this.restaurantId
    };

    const isUpdate = !!this.existingRating;

    if (isUpdate) {
      this.ratingService.updateRating(this.existingRating!.id!, payload).subscribe({
        next: () => {
          this.showRatingForm = false;
          this.existingRating = { ...this.existingRating!, ...payload };
          this.ratingService.getAverageRating(this.restaurantId).subscribe(avg => { this.averageRating = avg; });
          this.snackBar.open('Rating updated!', 'Close', { duration: 3000 });
        },
        error: () => { this.snackBar.open('Failed to update rating', 'Close', { duration: 3000 }); }
      });
    } else {
      this.ratingService.addRating(payload).subscribe({
        next: (created) => {
          this.showRatingForm = false;
          this.existingRating = created;
          this.ratingService.getAverageRating(this.restaurantId).subscribe(avg => { this.averageRating = avg; });
          this.snackBar.open('Rating submitted!', 'Close', { duration: 3000 });
        },
        error: () => { this.snackBar.open('Failed to submit rating', 'Close', { duration: 3000 }); }
      });
    }
  }
}
