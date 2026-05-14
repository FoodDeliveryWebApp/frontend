import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { RestaurantService } from '../../restaurant/services/restaurant.service';
import { AuthService } from '../../../infrastructure/auth/auth.service';
import { Restaurant } from '../../restaurant/model/restaurant.model';

@Injectable({ providedIn: 'root' })
export class ManagerService {
  private cachedRestaurant: Restaurant | null = null;

  constructor(
    private restaurantService: RestaurantService,
    private authService: AuthService
  ) {}

  getManagedRestaurant(): Observable<Restaurant | null> {
    if (this.cachedRestaurant) return of(this.cachedRestaurant);
    const user = this.authService.user$.getValue();
    return this.restaurantService.getAll().pipe(
      map(restaurants => restaurants.find(r => r.manager?.username === user.username) ?? null),
      tap(r => { this.cachedRestaurant = r; })
    );
  }

  clearCache(): void {
    this.cachedRestaurant = null;
  }
}
