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
import { AdminService } from '../services/admin.service';
import { DeliveryMan } from '../model/delivery-man.model';

@Component({
  selector: 'app-manage-delivery-men',
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
  templateUrl: './manage-delivery-men.component.html',
  styleUrl: './manage-delivery-men.component.css'
})
export class ManageDeliveryMenComponent implements OnInit {
  deliveryMen: DeliveryMan[] = [];
  loading = true;
  editingId: number | null = null;

  editForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    surname: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    isActive: new FormControl(true)
  });

  constructor(private adminService: AdminService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.adminService.getDeliveryMen().subscribe({
      next: (list) => { this.deliveryMen = list; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  startEdit(dm: DeliveryMan): void {
    this.editingId = dm.id;
    this.editForm.setValue({
      name: dm.name ?? '',
      surname: dm.surname ?? '',
      email: dm.email ?? '',
      isActive: dm.isActive
    });
  }

  cancelEdit(): void {
    this.editingId = null;
  }

  saveEdit(dm: DeliveryMan): void {
    if (!this.editForm.valid) {
      this.editForm.markAllAsTouched();
      return;
    }
    const v = this.editForm.value;
    this.adminService.updateDeliveryMan(dm.id, {
      name: v.name!,
      surname: v.surname!,
      email: v.email!,
      isActive: v.isActive!
    }).subscribe({
      next: () => {
        dm.name = v.name!;
        dm.surname = v.surname!;
        dm.email = v.email!;
        dm.isActive = v.isActive!;
        this.editingId = null;
        this.snackBar.open('Delivery man updated.', 'Close', { duration: 3000 });
      },
      error: () => this.snackBar.open('Update failed.', 'Close', { duration: 3000 })
    });
  }

  remove(dm: DeliveryMan): void {
    if (!confirm(`Remove ${dm.name ?? dm.username}?`)) return;
    this.adminService.deleteDeliveryMan(dm.id).subscribe({
      next: () => {
        this.deliveryMen = this.deliveryMen.filter(d => d.id !== dm.id);
        this.snackBar.open('Delivery man removed.', 'Close', { duration: 3000 });
      },
      error: () => this.snackBar.open('Remove failed.', 'Close', { duration: 3000 })
    });
  }
}
