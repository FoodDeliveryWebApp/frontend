import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SlicePipe, DecimalPipe } from '@angular/common';
import { OrderService } from '../services/order.service';
import { Order } from '../model/order.model';

@Component({
  selector: 'app-delivery-dashboard',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatDividerModule, MatIconModule, MatProgressSpinnerModule, SlicePipe, DecimalPipe],
  templateUrl: './delivery-dashboard.component.html',
  styleUrl: './delivery-dashboard.component.css'
})
export class DeliveryDashboardComponent implements OnInit {
  orders: Order[] = [];
  loading = true;

  constructor(private orderService: OrderService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.orderService.getDeliveryOrders().subscribe({
      next: (data) => { this.orders = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  updateStatus(orderId: number, status: string): void {
    this.orderService.updateStatus(orderId, status).subscribe({
      next: (updated) => {
        const o = this.orders.find(x => x.id === orderId);
        if (o) o.status = updated.status;
        this.snackBar.open(`Order marked as ${status}`, 'Close', { duration: 2000 });
      },
      error: () => this.snackBar.open('Action failed', 'Close', { duration: 2000 })
    });
  }

  statusClass(status: string): string {
    return 'status-' + status.toLowerCase().replace(' ', '');
  }
}
