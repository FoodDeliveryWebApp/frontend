import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { SlicePipe } from '@angular/common';
import { OrderReportService } from '../../order/services/order-report.service';
import { OrderReport } from '../../order/model/order-report.model';

@Component({
  selector: 'app-order-reports',
  standalone: true,
  imports: [
    MatCardModule, MatButtonModule, MatDividerModule, MatProgressSpinnerModule,
    MatFormFieldModule, MatInputModule, MatIconModule, FormsModule, SlicePipe
  ],
  templateUrl: './order-reports.html',
  styleUrl: './order-reports.css'
})
export class OrderReports implements OnInit {
  reports: OrderReport[] = [];
  loading = true;
  answeringId: number | null = null;
  answerText = '';
  submitting = false;

  constructor(
    private reportService: OrderReportService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.reportService.getAllReports().subscribe({
      next: (data) => { this.reports = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  startAnswer(reportId: number, existing: string | undefined): void {
    this.answeringId = reportId;
    this.answerText = existing ?? '';
  }

  cancelAnswer(): void {
    this.answeringId = null;
    this.answerText = '';
  }

  submitAnswer(): void {
    if (!this.answerText.trim() || this.answeringId === null) return;
    this.submitting = true;
    this.reportService.answerReport(this.answeringId, this.answerText).subscribe({
      next: (updated) => {
        const r = this.reports.find(x => x.id === updated.id);
        if (r) { r.answer = updated.answer; r.status = updated.status; }
        this.answeringId = null;
        this.answerText = '';
        this.submitting = false;
        this.snackBar.open('Reply sent', 'Close', { duration: 2000 });
      },
      error: () => {
        this.submitting = false;
        this.snackBar.open('Failed to send reply', 'Close', { duration: 2000 });
      }
    });
  }

  statusClass(status: string): string {
    return 'status-' + status.toLowerCase();
  }
}
