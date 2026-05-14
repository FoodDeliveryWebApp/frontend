import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RestaurantService } from '../../restaurant/services/restaurant.service';
import { ManagerService } from '../services/manager.service';

@Component({
  selector: 'app-add-food',
  standalone: true,
  imports: [ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './add-food.component.html',
  styleUrl: './add-food.component.css'
})
export class AddFoodComponent implements OnInit {
  restaurantId: number | null = null;
  loading = false;

  form = new FormGroup({
    name: new FormControl('', [Validators.required]),
    price: new FormControl<number | null>(null, [Validators.required, Validators.min(0.01)]),
    description: new FormControl('', [Validators.required]),
    imageUrl: new FormControl('', [Validators.required]),
  });

  constructor(
    private restaurantService: RestaurantService,
    private managerService: ManagerService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.managerService.getManagedRestaurant().subscribe(r => {
      this.restaurantId = r?.id ?? null;
    });
  }

  submit(): void {
    if (!this.form.valid || !this.restaurantId) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    const v = this.form.value;
    this.restaurantService.addFood(this.restaurantId, {
      name: v.name!,
      price: v.price!,
      description: v.description!,
      imageUrl: v.imageUrl!,
      restaurantId: this.restaurantId
    }).subscribe({
      next: () => {
        this.loading = false;
        this.form.reset();
        this.snackBar.open('Food item added!', 'Close', { duration: 3000 });
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Failed to add food item', 'Close', { duration: 3000 });
      }
    });
  }
}
