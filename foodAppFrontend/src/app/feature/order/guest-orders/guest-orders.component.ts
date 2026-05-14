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
  selector: 'app-guest-orders',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatDividerModule, MatProgressSpinnerModule, SlicePipe, DecimalPipe],
  templateUrl: './guest-orders.component.html',
  styleUrl: './guest-orders.component.css'
})
export class GuestOrdersComponent implements OnInit {
  orders: Order[] = [];
  loading = true;

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const userId = this.authService.user$.getValue().id;
    this.orderService.getGuestOrders(userId).subscribe({
      next: (data) => { this.orders = data.sort((a, b) => b.id - a.id); this.loading = false; },
      error: () => { this.loading = false; }
    });
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

  statusClass(status: string): string {
    return 'status-' + status.toLowerCase().replace(' ', '');
  }
}
