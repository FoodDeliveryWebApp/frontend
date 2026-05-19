import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SlicePipe, DecimalPipe } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { OrderService } from '../services/order.service';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { Order } from '../model/order.model';

@Component({
  selector: 'app-delivery-dashboard',
  standalone: true,
  imports: [
    MatCardModule, MatButtonModule, MatDividerModule, MatIconModule,
    MatProgressSpinnerModule, MatTabsModule, SlicePipe, DecimalPipe
  ],
  templateUrl: './delivery-dashboard.component.html',
  styleUrl: './delivery-dashboard.component.css'
})
export class DeliveryDashboardComponent implements OnInit {
  availableOrders: Order[] = [];
  myOrders: Order[] = [];
  deliveredOrders: Order[] = [];
  totalEarnings = 0;
  loading = true;
  currentUserId = 0;

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.currentUserId = user.id;
      if (user.id) this.loadAll();
    });
  }

  private loadAll(): void {
    this.loading = true;
    forkJoin({
      available: this.orderService.getDeliveryOrders().pipe(catchError(() => of([]))),
      mine: this.orderService.getDeliveryManOrders(this.currentUserId).pipe(
        catchError(() => of({ orders: [], totalEarnings: 0 }))
      )
    }).subscribe({
      next: ({ available, mine }) => {
        this.availableOrders = available;
        const all = mine.orders;
        this.totalEarnings = mine.totalEarnings;
        this.myOrders = all.filter(o => o.status === 'ToPickUp' || o.status === 'InDelivery');
        this.deliveredOrders = all.filter(o => o.status === 'Delivered');
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  claim(orderId: number): void {
    this.orderService.updateStatus(orderId, 'ToPickUp').subscribe({
      next: (updated) => {
        this.availableOrders = this.availableOrders.filter(o => o.id !== orderId);
        this.myOrders.push(updated);
        this.snackBar.open('Order claimed', 'Close', { duration: 2000 });
      },
      error: () => this.snackBar.open('Failed to claim order', 'Close', { duration: 2000 })
    });
  }

  pickUp(orderId: number): void {
    this.orderService.updateStatus(orderId, 'InDelivery').subscribe({
      next: (updated) => {
        const o = this.myOrders.find(x => x.id === orderId);
        if (o) o.status = updated.status;
        this.snackBar.open('Order picked up', 'Close', { duration: 2000 });
      },
      error: () => this.snackBar.open('Action failed', 'Close', { duration: 2000 })
    });
  }

  markDelivered(orderId: number): void {
    this.orderService.updateStatus(orderId, 'Delivered').subscribe({
      next: (updated) => {
        const order = this.myOrders.find(x => x.id === orderId);
        if (order) {
          this.myOrders = this.myOrders.filter(o => o.id !== orderId);
          this.deliveredOrders.unshift({ ...order, status: 'Delivered' });
          this.totalEarnings += order.deliveryPrice;
        }
        this.snackBar.open('Order delivered', 'Close', { duration: 2000 });
      },
      error: () => this.snackBar.open('Action failed', 'Close', { duration: 2000 })
    });
  }

  statusClass(status: string): string {
    return 'status-' + status.toLowerCase();
  }
}
