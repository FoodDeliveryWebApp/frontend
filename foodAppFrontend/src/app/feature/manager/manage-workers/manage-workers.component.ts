import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { RouterLink } from '@angular/router';
import { ManagerService } from '../services/manager.service';
import { RestaurantService } from '../../restaurant/services/restaurant.service';
import { Worker } from '../../restaurant/model/restaurant.model';

@Component({
  selector: 'app-manage-workers',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ],
  templateUrl: './manage-workers.component.html',
  styleUrl: './manage-workers.component.css'
})
export class ManageWorkersComponent implements OnInit {
  restaurantId: number | null = null;
  workers: Worker[] = [];
  loading = true;
  editingId: number | null = null;

  editForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    surname: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    isActive: new FormControl(true)
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
        this.loadWorkers();
      } else {
        this.loading = false;
      }
    });
  }

  loadWorkers(): void {
    this.loading = true;
    this.restaurantService.getWorkers(this.restaurantId!).subscribe({
      next: (w) => { this.workers = w; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  startEdit(worker: Worker): void {
    this.editingId = worker.id;
    this.editForm.setValue({
      name: worker.name ?? '',
      surname: worker.surname ?? '',
      email: worker.email ?? '',
      isActive: worker.isActive
    });
  }

  cancelEdit(): void {
    this.editingId = null;
  }

  saveEdit(worker: Worker): void {
    if (!this.editForm.valid) {
      this.editForm.markAllAsTouched();
      return;
    }
    const v = this.editForm.value;
    this.restaurantService.updateWorker(this.restaurantId!, worker.id, {
      name: v.name!,
      surname: v.surname!,
      email: v.email!,
      isActive: v.isActive!
    }).subscribe({
      next: () => {
        worker.name = v.name!;
        worker.surname = v.surname!;
        worker.email = v.email!;
        worker.isActive = v.isActive!;
        this.editingId = null;
        this.snackBar.open('Worker updated.', 'Close', { duration: 3000 });
      },
      error: () => this.snackBar.open('Update failed.', 'Close', { duration: 3000 })
    });
  }

  remove(worker: Worker): void {
    if (!confirm(`Remove ${worker.name ?? worker.username} from your restaurant?`)) return;
    this.restaurantService.removeWorker(this.restaurantId!, worker.id).subscribe({
      next: () => {
        this.workers = this.workers.filter(w => w.id !== worker.id);
        this.snackBar.open('Worker removed.', 'Close', { duration: 3000 });
      },
      error: () => this.snackBar.open('Remove failed.', 'Close', { duration: 3000 })
    });
  }
}
