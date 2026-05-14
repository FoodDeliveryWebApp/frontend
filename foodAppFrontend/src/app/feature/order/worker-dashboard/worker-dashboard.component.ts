import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SlicePipe, DecimalPipe } from '@angular/common';
import { OrderService } from '../services/order.service';
import { AuthService } from '../../../infrastructure/auth/auth.service';
import { Order } from '../model/order.model';

@Component({
  selector: 'app-worker-dashboard',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatDividerModule, MatProgressSpinnerModule, SlicePipe, DecimalPipe],
  templateUrl: './worker-dashboard.component.html',
  styleUrl: './worker-dashboard.component.css'
})
export class WorkerDashboardComponent implements OnInit {
  orders: Order[] = [];
  loading = true;

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const userId = this.authService.user$.getValue().id;
    this.orderService.getWorkerOrders(userId).subscribe({
      next: (data) => { this.orders = data.sort((a, b) => b.id - a.id); this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  updateStatus(orderId: number, status: string): void {
    this.orderService.updateStatus(orderId, status).subscribe({
      next: (updated) => {
        const o = this.orders.find(x => x.id === orderId);
        if (o) o.status = updated.status;
        this.snackBar.open(`Order ${status}`, 'Close', { duration: 2000 });
      },
      error: () => this.snackBar.open('Action failed', 'Close', { duration: 2000 })
    });
  }

  statusClass(status: string): string {
    return 'status-' + status.toLowerCase().replace(' ', '');
  }
}
