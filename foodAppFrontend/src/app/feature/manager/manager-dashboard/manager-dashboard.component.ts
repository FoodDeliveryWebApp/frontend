import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ManagerService } from '../services/manager.service';
import { RestaurantService } from '../../restaurant/services/restaurant.service';
import { Restaurant } from '../../restaurant/model/restaurant.model';
import { environment } from 'src/env/environment';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatFormFieldModule, MatInputModule],
  templateUrl: './manager-dashboard.component.html',
  styleUrl: './manager-dashboard.component.css'
})
export class ManagerDashboardComponent implements OnInit {
  restaurant: Restaurant | null = null;
  loading = true;
  editingFee = false;
  savingFee = false;
  feeCtrl = new FormControl<number | null>(null, [Validators.required, Validators.min(0)]);

  private backendHost = environment.apiHost.replace('api/', '');

  constructor(
    private managerService: ManagerService,
    private restaurantService: RestaurantService,
    private snackBar: MatSnackBar
  ) {}

  getImageUrl(path: string): string {
    return this.backendHost + path;
  }

  ngOnInit(): void {
    this.managerService.getManagedRestaurant().subscribe({
      next: (r) => { this.restaurant = r; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  startEditFee(): void {
    this.feeCtrl.setValue(this.restaurant?.deliveryFee ?? 0);
    this.editingFee = true;
  }

  cancelEditFee(): void {
    this.editingFee = false;
  }

  saveFee(): void {
    if (this.feeCtrl.invalid || !this.restaurant) return;
    this.savingFee = true;
    this.restaurantService.updateDeliveryFee(this.restaurant.id, this.feeCtrl.value!).subscribe({
      next: () => {
        this.restaurant!.deliveryFee = this.feeCtrl.value!;
        this.managerService.clearCache();
        this.editingFee = false;
        this.savingFee = false;
        this.snackBar.open('Delivery fee updated.', 'Close', { duration: 3000 });
      },
      error: () => {
        this.savingFee = false;
        this.snackBar.open('Failed to update delivery fee.', 'Close', { duration: 3000 });
      }
    });
  }
}
