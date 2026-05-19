import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DecimalPipe } from '@angular/common';
import { switchMap } from 'rxjs';
import { ManagerService } from '../services/manager.service';
import { RestaurantService } from '../../restaurant/services/restaurant.service';
import { Food } from '../../restaurant/model/food.model';
import { environment } from 'src/env/environment';

@Component({
  selector: 'app-manage-foods',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    DecimalPipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ],
  templateUrl: './manage-foods.component.html',
  styleUrl: './manage-foods.component.css'
})
export class ManageFoodsComponent implements OnInit {
  restaurantId: number | null = null;
  foods: Food[] = [];
  loading = true;
  editingId: number | null = null;
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  private backendHost = environment.apiHost.replace('api/', '');

  editForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    price: new FormControl<number | null>(null, [Validators.required, Validators.min(0.01)]),
    deliveryPrice: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
    description: new FormControl('', [Validators.required])
  });

  constructor(
    private managerService: ManagerService,
    private restaurantService: RestaurantService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.managerService.getManagedRestaurant().subscribe(r => {
      this.restaurantId = r?.id ?? null;
      if (this.restaurantId) {
        this.loadFoods();
      } else {
        this.loading = false;
      }
    });
  }

  getImageUrl(path: string): string {
    return this.backendHost + path;
  }

  loadFoods(): void {
    this.loading = true;
    this.restaurantService.getFoodsByRestaurant(this.restaurantId!).subscribe({
      next: (f) => { this.foods = f; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  startEdit(food: Food): void {
    this.editingId = food.id;
    this.selectedFile = null;
    this.imagePreview = null;
    this.editForm.setValue({
      name: food.name,
      price: food.price,
      deliveryPrice: food.deliveryPrice,
      description: food.description
    });
  }

  cancelEdit(): void {
    this.editingId = null;
    this.selectedFile = null;
    this.imagePreview = null;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.selectedFile = input.files[0];
    const reader = new FileReader();
    reader.onload = () => { this.imagePreview = reader.result as string; };
    reader.readAsDataURL(this.selectedFile);
  }

  saveEdit(food: Food): void {
    if (!this.editForm.valid) {
      this.editForm.markAllAsTouched();
      return;
    }
    const v = this.editForm.value;

    const doUpdate = (imageUrl: string) => {
      const updated: Food = {
        ...food,
        name: v.name!,
        price: v.price!,
        deliveryPrice: v.deliveryPrice!,
        description: v.description!,
        imageUrl
      };
      this.restaurantService.updateFood(food.id, updated).subscribe({
        next: () => {
          Object.assign(food, updated);
          this.editingId = null;
          this.selectedFile = null;
          this.imagePreview = null;
          this.snackBar.open('Food item updated.', 'Close', { duration: 3000 });
        },
        error: () => this.snackBar.open('Update failed.', 'Close', { duration: 3000 })
      });
    };

    if (this.selectedFile) {
      this.restaurantService.uploadFoodImage(this.selectedFile).subscribe({
        next: (url) => doUpdate(url),
        error: () => this.snackBar.open('Image upload failed.', 'Close', { duration: 3000 })
      });
    } else {
      doUpdate(food.imageUrl);
    }
  }

  remove(food: Food): void {
    if (!confirm(`Remove "${food.name}" from the menu?`)) return;
    this.restaurantService.removeFood(food.id).subscribe({
      next: () => {
        this.foods = this.foods.filter(f => f.id !== food.id);
        this.snackBar.open('Food item removed.', 'Close', { duration: 3000 });
      },
      error: () => this.snackBar.open('Remove failed.', 'Close', { duration: 3000 })
    });
  }
}
