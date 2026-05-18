import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DecimalPipe } from '@angular/common';
import { OrderService } from '../../order/services/order.service';
import { AuthService } from '../../../infrastructure/auth/auth.service';
import { Order } from '../../order/model/order.model';

@Component({
  selector: 'app-earnings',
  standalone: true,
  imports: [MatCardModule, MatDividerModule, MatProgressSpinnerModule, DecimalPipe],
  templateUrl: './earnings.component.html',
  styleUrl: './earnings.component.css'
})
export class EarningsComponent implements OnInit {
  orders: Order[] = [];
  totalEarnings = 0;
  loading = true;

  constructor(
    private orderService: OrderService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const managerId = this.authService.user$.getValue().id;
    this.orderService.getManagerEarnings(managerId).subscribe({
      next: (data) => {
        this.orders = data.orders ?? [];
        this.totalEarnings = data.totalEarnings ?? 0;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  statusClass(status: string): string {
    return 'status-' + status.toLowerCase().replace(' ', '');
  }
}
