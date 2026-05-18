import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import { RestaurantService } from '../../restaurant/services/restaurant.service';

@Component({
  selector: 'app-add-restaurant',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatDividerModule, MatProgressSpinnerModule, MatIconModule],
  templateUrl: './add-restaurant.component.html',
  styleUrl: './add-restaurant.component.css'
})
export class AddRestaurantComponent {
  loading = false;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  cuisines = ['Italian', 'Chinese', 'Serbian', 'Indian', 'Mexican', 'American', 'Other'];

  form = new FormGroup({
    name: new FormControl('', [Validators.required]),
    address: new FormControl('', [Validators.required]),
    phoneNumber: new FormControl('', [Validators.required]),
    cuisine: new FormControl('', [Validators.required]),
    managerUsername: new FormControl('', [Validators.required]),
    managerPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
    managerName: new FormControl('', [Validators.required]),
    managerSurname: new FormControl('', [Validators.required]),
    managerEmail: new FormControl('', [Validators.required, Validators.email]),
  });

  constructor(private restaurantService: RestaurantService, private snackBar: MatSnackBar) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = () => { this.imagePreview = reader.result as string; };
    reader.readAsDataURL(file);
  }

  submit(): void {
    if (!this.form.valid) { this.form.markAllAsTouched(); return; }
    if (!this.selectedFile) {
      this.snackBar.open('Please select an image', 'Close', { duration: 2000 });
      return;
    }
    this.loading = true;
    const v = this.form.value;

    this.restaurantService.uploadRestaurantImage(this.selectedFile).pipe(
      switchMap(imageUrl => this.restaurantService.addRestaurant({
        name: v.name,
        address: v.address,
        phoneNumber: v.phoneNumber,
        cuisine: v.cuisine,
        imageUrl,
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
      }))
    ).subscribe({
      next: () => {
        this.loading = false;
        this.form.reset();
        this.selectedFile = null;
        this.imagePreview = null;
        this.snackBar.open('Restaurant added!', 'Close', { duration: 3000 });
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Failed to add restaurant', 'Close', { duration: 3000 });
      }
    });
  }
}
