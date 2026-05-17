import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { RestaurantService } from '../../restaurant/services/restaurant.service';
import { ManagerService } from '../services/manager.service';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-add-food',
  standalone: true,
  imports: [ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatProgressSpinnerModule, MatIconModule],
  templateUrl: './add-food.component.html',
  styleUrl: './add-food.component.css'
})
export class AddFoodComponent implements OnInit {
  restaurantId: number | null = null;
  loading = false;
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  form = new FormGroup({
    name: new FormControl('', [Validators.required]),
    price: new FormControl<number | null>(null, [Validators.required, Validators.min(0.01)]),
    description: new FormControl('', [Validators.required]),
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
    if (!this.form.valid || !this.restaurantId) {
      this.form.markAllAsTouched();
      return;
    }
    if (!this.selectedFile) {
      this.snackBar.open('Please select an image', 'Close', { duration: 2000 });
      return;
    }
    this.loading = true;
    const v = this.form.value;

    this.restaurantService.uploadFoodImage(this.selectedFile).pipe(
      switchMap(imageUrl =>
        this.restaurantService.addFood(this.restaurantId!, {
          name: v.name!,
          price: v.price!,
          description: v.description!,
          imageUrl,
          restaurantId: this.restaurantId!
        })
      )
    ).subscribe({
      next: () => {
        this.loading = false;
        this.form.reset();
        this.selectedFile = null;
        this.imagePreview = null;
        this.snackBar.open('Food item added!', 'Close', { duration: 3000 });
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Failed to add food item', 'Close', { duration: 3000 });
      }
    });
  }
}
