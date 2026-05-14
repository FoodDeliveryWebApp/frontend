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
  selector: 'app-add-worker',
  standalone: true,
  imports: [ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './add-worker.component.html',
  styleUrl: './add-worker.component.css'
})
export class AddWorkerComponent implements OnInit {
  restaurantId: number | null = null;
  loading = false;
  success = false;

  form = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    name: new FormControl('', [Validators.required]),
    surname: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
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
    this.restaurantService.addWorker(this.restaurantId, {
      username: v.username!,
      password: v.password!,
      name: v.name!,
      surname: v.surname!,
      email: v.email!,
      role: 'Worker',
      isActive: true
    }).subscribe({
      next: () => {
        this.loading = false;
        this.form.reset();
        this.snackBar.open('Worker added successfully!', 'Close', { duration: 3000 });
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Failed to add worker', 'Close', { duration: 3000 });
      }
    });
  }
}
