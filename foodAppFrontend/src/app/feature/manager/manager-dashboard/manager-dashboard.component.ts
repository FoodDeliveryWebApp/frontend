import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ManagerService } from '../services/manager.service';
import { Restaurant } from '../../restaurant/model/restaurant.model';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './manager-dashboard.component.html',
  styleUrl: './manager-dashboard.component.css'
})
export class ManagerDashboardComponent implements OnInit {
  restaurant: Restaurant | null = null;
  loading = true;

  constructor(private managerService: ManagerService) {}

  ngOnInit(): void {
    this.managerService.getManagedRestaurant().subscribe({
      next: (r) => { this.restaurant = r; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }
}
