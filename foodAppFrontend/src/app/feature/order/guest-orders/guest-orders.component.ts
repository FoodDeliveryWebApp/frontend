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
import { SlicePipe, DecimalPipe } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { OrderService } from '../services/order.service';
import { OrderReportService } from '../services/order-report.service';
import { AuthService } from '../../../infrastructure/auth/auth.service';
import { Order } from '../model/order.model';
import { OrderReport } from '../model/order-report.model';

@Component({
  selector: 'app-guest-orders',
  standalone: true,
  imports: [
    MatCardModule, MatButtonModule, MatDividerModule, MatProgressSpinnerModule,
    MatFormFieldModule, MatInputModule, MatIconModule, FormsModule,
    SlicePipe, DecimalPipe
  ],
  templateUrl: './guest-orders.component.html',
  styleUrl: './guest-orders.component.css'
})
export class GuestOrdersComponent implements OnInit {
  orders: Order[] = [];
  reports: OrderReport[] = [];
  loading = true;
  reportingOrderId: number | null = null;
  reportText = '';
  submitting = false;

  constructor(
    private orderService: OrderService,
    private reportService: OrderReportService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const userId = this.authService.user$.getValue().id;
    forkJoin({
      orders: this.orderService.getGuestOrders(userId).pipe(catchError(() => of([]))),
      reports: this.reportService.getMyReports().pipe(catchError(() => of([])))
    }).subscribe(({ orders, reports }) => {
      this.orders = orders.sort((a, b) => b.id - a.id);
      this.reports = reports;
      this.loading = false;
    });
  }

  reportForOrder(orderId: number): OrderReport | undefined {
    return this.reports.find(r => r.orderId === orderId);
  }

  cancel(orderId: number): void {
    this.orderService.updateStatus(orderId, 'Canceled').subscribe({
      next: (updated) => {
        const o = this.orders.find(x => x.id === orderId);
        if (o) o.status = updated.status;
        this.snackBar.open('Order cancelled', 'Close', { duration: 2000 });
      },
      error: () => this.snackBar.open('Failed to cancel order', 'Close', { duration: 2000 })
    });
  }

  startReport(orderId: number): void {
    this.reportingOrderId = orderId;
    this.reportText = '';
  }

  cancelReport(): void {
    this.reportingOrderId = null;
    this.reportText = '';
  }

  submitReport(): void {
    if (!this.reportText.trim() || !this.reportingOrderId) return;
    this.submitting = true;
    this.reportService.createReport({ orderId: this.reportingOrderId, description: this.reportText }).subscribe({
      next: (report) => {
        this.reports.push(report);
        this.reportingOrderId = null;
        this.reportText = '';
        this.submitting = false;
        this.snackBar.open('Report submitted', 'Close', { duration: 2000 });
      },
      error: (err) => {
        this.submitting = false;
        this.snackBar.open(err?.error || 'Failed to submit report', 'Close', { duration: 3000 });
      }
    });
  }

  statusClass(status: string): string {
    return 'status-' + status.toLowerCase().replace(' ', '');
  }
}
