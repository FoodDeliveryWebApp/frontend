import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ManagerService } from '../services/manager.service';
import { Restaurant } from '../../restaurant/model/restaurant.model';
import { environment } from 'src/env/environment';

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

  private backendHost = environment.apiHost.replace('api/', '');

  constructor(private managerService: ManagerService) {}

  getImageUrl(path: string): string {
    return this.backendHost + path;
  }

  ngOnInit(): void {
    this.managerService.getManagedRestaurant().subscribe({
      next: (r) => { this.restaurant = r; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }
}
