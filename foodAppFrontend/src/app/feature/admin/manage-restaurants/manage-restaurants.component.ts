import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { RouterLink } from '@angular/router';
import { switchMap, of } from 'rxjs';
import { environment } from 'src/env/environment';
import { RestaurantService } from '../../restaurant/services/restaurant.service';
import { Restaurant } from '../../restaurant/model/restaurant.model';

@Component({
  selector: 'app-manage-restaurants',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatExpansionModule
  ],
  templateUrl: './manage-restaurants.component.html',
  styleUrl: './manage-restaurants.component.css'
})
export class ManageRestaurantsComponent implements OnInit {
  restaurants: Restaurant[] = [];
  loading = true;
  private backendHost = environment.apiHost.replace('api/', '');
  editingId: number | null = null;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  cuisines = ['Italian', 'Chinese', 'Serbian', 'Indian', 'Mexican', 'American', 'Other'];

  editForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    address: new FormControl('', [Validators.required]),
    phoneNumber: new FormControl('', [Validators.required]),
    cuisine: new FormControl('', [Validators.required]),
    isActive: new FormControl(true),
    managerName: new FormControl(''),
    managerSurname: new FormControl(''),
    managerEmail: new FormControl('', [Validators.email]),
    managerIsActive: new FormControl(true),
    replaceManager: new FormControl(false),
    newManagerUsername: new FormControl(''),
    newManagerPassword: new FormControl('', [Validators.minLength(6)]),
    newManagerName: new FormControl(''),
    newManagerSurname: new FormControl(''),
    newManagerEmail: new FormControl('', [Validators.email]),
  });

  constructor(private restaurantService: RestaurantService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.restaurantService.getAll().subscribe({
      next: (list) => { this.restaurants = list; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  startEdit(r: Restaurant): void {
    this.editingId = r.id;
    this.selectedFile = null;
    this.imagePreview = null;
    this.editForm.patchValue({
      name: r.name,
      address: r.address,
      phoneNumber: r.phoneNumber,
      cuisine: this.cuisines.find(c => c.toLowerCase() === r.cuisine?.toLowerCase()) ?? r.cuisine,
      isActive: r.isActive,
      managerName: r.manager?.name ?? '',
      managerSurname: r.manager?.surname ?? '',
      managerEmail: r.manager?.email ?? '',
      managerIsActive: r.manager?.isActive ?? true,
      replaceManager: false,
      newManagerUsername: '',
      newManagerPassword: '',
      newManagerName: '',
      newManagerSurname: '',
      newManagerEmail: ''
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
    const file = input.files[0];
    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = () => { this.imagePreview = reader.result as string; };
    reader.readAsDataURL(file);
  }

  saveEdit(r: Restaurant): void {
    if (!this.editForm.valid) {
      this.editForm.markAllAsTouched();
      return;
    }
    const v = this.editForm.value;
    const replaceManager = v.replaceManager;

    if (replaceManager && (!v.newManagerUsername || !v.newManagerPassword)) {
      this.snackBar.open('New manager requires username and password.', 'Close', { duration: 3000 });
      return;
    }

    const buildPayload = (imageUrl: string) => ({
      name: v.name!,
      address: v.address!,
      phoneNumber: v.phoneNumber!,
      cuisine: v.cuisine!,
      imageUrl,
      isActive: v.isActive!,
      manager: replaceManager ? {
        username: v.newManagerUsername!,
        password: v.newManagerPassword!,
        name: v.newManagerName || v.newManagerUsername,
        surname: v.newManagerSurname || '-',
        email: v.newManagerEmail || v.newManagerUsername,
        isActive: true,
        role: 'Manager'
      } : {
        id: r.manager?.id,
        username: r.manager?.username,
        name: v.managerName,
        surname: v.managerSurname,
        email: v.managerEmail,
        isActive: v.managerIsActive!,
        role: 'Manager'
      }
    });

    const upload$ = this.selectedFile
      ? this.restaurantService.uploadRestaurantImage(this.selectedFile)
      : of(r.imageUrl);

    upload$.pipe(
      switchMap(imageUrl => this.restaurantService.updateRestaurant(r.id, buildPayload(imageUrl)))
    ).subscribe({
      next: (updated) => {
        const idx = this.restaurants.findIndex(x => x.id === r.id);
        if (idx !== -1) this.restaurants[idx] = updated;
        this.editingId = null;
        this.selectedFile = null;
        this.imagePreview = null;
        this.snackBar.open('Restaurant updated.', 'Close', { duration: 3000 });
      },
      error: () => this.snackBar.open('Update failed.', 'Close', { duration: 3000 })
    });
  }

  remove(r: Restaurant): void {
    if (!confirm(`Delete restaurant "${r.name}"? This will also delete its manager account.`)) return;
    this.restaurantService.deleteRestaurant(r.id).subscribe({
      next: () => {
        this.restaurants = this.restaurants.filter(x => x.id !== r.id);
        this.snackBar.open('Restaurant deleted.', 'Close', { duration: 3000 });
      },
      error: () => this.snackBar.open('Delete failed.', 'Close', { duration: 3000 })
    });
  }

  get replaceManager(): boolean {
    return !!this.editForm.get('replaceManager')?.value;
  }

  getImageUrl(path: string): string {
    return this.backendHost + path;
  }
}
