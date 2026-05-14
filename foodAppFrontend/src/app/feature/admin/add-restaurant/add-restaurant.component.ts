import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RestaurantService } from '../../restaurant/services/restaurant.service';

@Component({
  selector: 'app-add-restaurant',
  standalone: true,
  imports: [ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatDividerModule, MatProgressSpinnerModule],
  templateUrl: './add-restaurant.component.html',
  styleUrl: './add-restaurant.component.css'
})
export class AddRestaurantComponent {
  loading = false;
  cuisines = ['Italian', 'Chinese', 'Serbian', 'Indian', 'Mexican', 'American', 'Other'];

  form = new FormGroup({
    name: new FormControl('', [Validators.required]),
    address: new FormControl('', [Validators.required]),
    phoneNumber: new FormControl('', [Validators.required]),
    cuisine: new FormControl('', [Validators.required]),
    imageUrl: new FormControl('', [Validators.required]),
    managerUsername: new FormControl('', [Validators.required]),
    managerPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
    managerName: new FormControl('', [Validators.required]),
    managerSurname: new FormControl('', [Validators.required]),
    managerEmail: new FormControl('', [Validators.required, Validators.email]),
  });

  constructor(private restaurantService: RestaurantService, private snackBar: MatSnackBar) {}

  submit(): void {
    if (!this.form.valid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    const v = this.form.value;
    this.restaurantService.addRestaurant({
      name: v.name,
      address: v.address,
      phoneNumber: v.phoneNumber,
      cuisine: v.cuisine,
      imageUrl: v.imageUrl,
      isActive: true,
      manager: {
        username: v.managerUsername,
        password: v.managerPassword,
        role: 'Manager',
        isActive: true,
        name: v.managerName,
        surname: v.managerSurname,
        email: v.managerEmail
      }
    }).subscribe({
      next: () => {
        this.loading = false;
        this.form.reset();
        this.snackBar.open('Restaurant added!', 'Close', { duration: 3000 });
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Failed to add restaurant', 'Close', { duration: 3000 });
      }
    });
  }
}
