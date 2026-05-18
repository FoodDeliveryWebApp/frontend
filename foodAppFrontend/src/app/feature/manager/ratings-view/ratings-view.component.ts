import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SlicePipe, DecimalPipe } from '@angular/common';
import { RatingService } from '../../rating/services/rating.service';
import { ManagerService } from '../services/manager.service';
import { RestaurantRating } from '../../rating/model/restaurant-rating.model';

@Component({
  selector: 'app-ratings-view',
  standalone: true,
  imports: [
    FormsModule, MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatDividerModule,
    MatProgressSpinnerModule, SlicePipe, DecimalPipe
  ],
  templateUrl: './ratings-view.component.html',
  styleUrl: './ratings-view.component.css'
})
export class RatingsViewComponent implements OnInit {
  ratings: RestaurantRating[] = [];
  loading = true;

  // index → report status ('Pending' | 'Approved' | 'Rejected')
  statusByIndex = new Map<number, string>();

  openIndex: number | null = null;
  reportReason = '';
  submitting = false;

  constructor(
    private ratingService: RatingService,
    private managerService: ManagerService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.managerService.getManagedRestaurant().subscribe({
      next: (restaurant) => {
        if (!restaurant) { this.loading = false; return; }
        this.ratingService.getRatingsForRestaurant(restaurant.id).subscribe({
          next: (data) => {
            this.ratings = data;
            this.loading = false;
            this.loadStatuses();
          },
          error: () => { this.loading = false; }
        });
      },
      error: () => { this.loading = false; }
    });
  }

  private loadStatuses(): void {
    this.ratingService.getManagerReports().subscribe({
      next: (reports) => {
        reports.forEach(report => {
          const idx = this.ratings.findIndex(r => r.id === report.ratingId);
          if (idx >= 0) this.statusByIndex.set(idx, report.status ?? 'Pending');
        });
      },
      error: (err) => {
        console.error('Failed to load report statuses:', err?.error ?? err);
      }
    });
  }

  statusAt(index: number): string | null {
    return this.statusByIndex.get(index) ?? null;
  }

  openForm(index: number): void {
    this.openIndex = index;
    this.reportReason = '';
  }

  cancelForm(): void {
    this.openIndex = null;
    this.reportReason = '';
  }

  submitReport(index: number): void {
    const ratingId = this.ratings[index]?.id;
    if (!this.reportReason.trim()) {
      this.snackBar.open('Please enter a reason.', 'Close', { duration: 2000 });
      return;
    }
    if (!ratingId) {
      this.snackBar.open('Rating ID not available — please rebuild the backend.', 'Close', { duration: 4000 });
      return;
    }
    this.submitting = true;
    this.ratingService.createReport({ ratingId, reason: this.reportReason.trim() }).subscribe({
      next: () => {
        this.statusByIndex.set(index, 'Pending');
        this.openIndex = null;
        this.reportReason = '';
        this.submitting = false;
        this.snackBar.open('Report submitted.', 'Close', { duration: 3000 });
      },
      error: (err) => {
        this.submitting = false;
        this.snackBar.open(err?.error ?? 'Failed to submit report.', 'Close', { duration: 3000 });
      }
    });
  }

  averageRating(): number {
    if (!this.ratings.length) return 0;
    return this.ratings.reduce((s, r) => s + r.rating, 0) / this.ratings.length;
  }
}
