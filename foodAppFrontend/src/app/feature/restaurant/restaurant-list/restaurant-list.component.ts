import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RestaurantService } from '../services/restaurant.service';
import { Restaurant } from '../model/restaurant.model';
import { environment } from 'src/env/environment';

@Component({
  selector: 'app-restaurant-list',
  standalone: true,
  imports: [RouterLink, FormsModule, MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatProgressSpinnerModule],
  templateUrl: './restaurant-list.component.html',
  styleUrl: './restaurant-list.component.css'
})
export class RestaurantListComponent implements OnInit {
  restaurants: Restaurant[] = [];
  filtered: Restaurant[] = [];
  search = '';
  loading = true;

  private backendHost = environment.apiHost.replace('api/', '');

  constructor(private restaurantService: RestaurantService) {}

  getImageUrl(path: string): string {
    return this.backendHost + path;
  }

  ngOnInit(): void {
    this.restaurantService.getAll().subscribe({
      next: (data) => {
        this.restaurants = data.filter(r => r.isActive);
        this.filtered = this.restaurants;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  onSearch(): void {
    const q = this.search.toLowerCase();
    this.filtered = this.restaurants.filter(r =>
      r.name.toLowerCase().includes(q) || r.cuisine.toLowerCase().includes(q)
    );
  }
}
