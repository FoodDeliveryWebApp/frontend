import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SlicePipe, DecimalPipe } from '@angular/common';
import { RatingService } from '../../rating/services/rating.service';
import { ManagerService } from '../services/manager.service';
import { RestaurantRating } from '../../rating/model/restaurant-rating.model';

@Component({
  selector: 'app-ratings-view',
  standalone: true,
  imports: [MatCardModule, MatDividerModule, MatProgressSpinnerModule, SlicePipe, DecimalPipe],
  templateUrl: './ratings-view.component.html',
  styleUrl: './ratings-view.component.css'
})
export class RatingsViewComponent implements OnInit {
  ratings: RestaurantRating[] = [];
  loading = true;

  constructor(
    private ratingService: RatingService,
    private managerService: ManagerService
  ) {}

  ngOnInit(): void {
    this.managerService.getManagedRestaurant().subscribe(r => {
      if (r) {
        this.ratingService.getRatingsForRestaurant(r.id).subscribe({
          next: (data) => { this.ratings = data; this.loading = false; },
          error: () => { this.loading = false; }
        });
      } else {
        this.loading = false;
      }
    });
  }

  averageRating(): number {
    if (!this.ratings.length) return 0;
    return this.ratings.reduce((s, r) => s + r.rating, 0) / this.ratings.length;
  }
}
