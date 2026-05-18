import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SlicePipe } from '@angular/common';
import { RatingService } from '../../rating/services/rating.service';
import { RatingReport } from '../../rating/model/restaurant-rating.model';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatIconModule, MatDividerModule, MatProgressSpinnerModule, SlicePipe],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent implements OnInit {
  reports: RatingReport[] = [];
  loading = true;

  constructor(private ratingService: RatingService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.ratingService.getAllReports().subscribe({
      next: (data) => { this.reports = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  updateStatus(reportId: number, status: string): void {
    this.ratingService.updateReportStatus(reportId, status).subscribe({
      next: (updated) => {
        const r = this.reports.find(x => x.id === reportId);
        if (r) r.status = updated.status;
        if (status === 'Approved') {
          this.snackBar.open('Report approved — rating has been removed.', 'Close', { duration: 3000 });
        } else {
          this.snackBar.open('Report rejected.', 'Close', { duration: 2000 });
        }
      },
      error: () => this.snackBar.open('Action failed', 'Close', { duration: 2000 })
    });
  }

  statusClass(status: string = ''): string {
    return 'status-' + status.toLowerCase();
  }
}
