import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DecimalPipe } from '@angular/common';
import { OrderService } from '../../order/services/order.service';
import { RatingService } from '../../rating/services/rating.service';
import { AuthService } from '../../../infrastructure/auth/auth.service';
import { Order } from '../../order/model/order.model';

@Component({
  selector: 'app-earnings',
  standalone: true,
  imports: [ReactiveFormsModule, MatCardModule, MatButtonModule, MatDividerModule, MatFormFieldModule, MatInputModule, MatProgressSpinnerModule, DecimalPipe],
  templateUrl: './earnings.component.html',
  styleUrl: './earnings.component.css'
})
export class EarningsComponent implements OnInit {
  orders: Order[] = [];
  totalEarnings = 0;
  loading = true;
  reportingOrderId: number | null = null;
  managerId = 0;

  reportForm = new FormGroup({
    comment: new FormControl('', [Validators.required])
  });

  constructor(
    private orderService: OrderService,
    private ratingService: RatingService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.managerId = this.authService.user$.getValue().id;
    this.orderService.getManagerEarnings(this.managerId).subscribe({
      next: (data) => {
        this.orders = data.orders ?? [];
        this.totalEarnings = data.totalEarnings ?? 0;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  startReport(orderId: number): void {
    this.reportingOrderId = orderId;
    this.reportForm.reset();
  }

  submitReport(): void {
    if (!this.reportForm.valid || !this.reportingOrderId) {
      this.reportForm.markAllAsTouched();
      return;
    }
    this.ratingService.createReport({
      orderId: this.reportingOrderId,
      managerId: this.managerId,
      comment: this.reportForm.value.comment!
    }).subscribe({
      next: () => {
        this.reportingOrderId = null;
        this.snackBar.open('Report submitted to admin', 'Close', { duration: 3000 });
      },
      error: () => this.snackBar.open('Failed to submit report', 'Close', { duration: 3000 })
    });
  }

  statusClass(status: string): string {
    return 'status-' + status.toLowerCase().replace(' ', '');
  }
}
