import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminService } from '../services/admin.service';
import { RestaurantApplication } from '../model/restaurant-application.model';

@Component({
  selector: 'app-applications',
  standalone: true,
  imports: [ReactiveFormsModule, MatCardModule, MatButtonModule, MatDividerModule, MatFormFieldModule, MatInputModule, MatProgressSpinnerModule],
  templateUrl: './applications.component.html',
  styleUrl: './applications.component.css'
})
export class ApplicationsComponent implements OnInit {
  applications: RestaurantApplication[] = [];
  loading = true;
  processingId: number | null = null;
  processingDecision: 'Approved' | 'Rejected' | null = null;

  commentForm = new FormGroup({
    adminComment: new FormControl('')
  });

  constructor(private adminService: AdminService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.adminService.getAllApplications().subscribe({
      next: (data) => { this.applications = data.sort((a, b) => (b.id ?? 0) - (a.id ?? 0)); this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  startProcess(id: number, decision: 'Approved' | 'Rejected'): void {
    this.processingId = id;
    this.processingDecision = decision;
    this.commentForm.reset();
  }

  confirm(): void {
    if (!this.processingId || !this.processingDecision) return;
    this.adminService.processApplication(
      this.processingId,
      this.processingDecision,
      this.commentForm.value.adminComment ?? ''
    ).subscribe({
      next: () => {
        this.snackBar.open(`Application ${this.processingDecision}`, 'Close', { duration: 3000 });
        this.processingId = null;
        this.processingDecision = null;
        this.load();
      },
      error: () => this.snackBar.open('Action failed', 'Close', { duration: 3000 })
    });
  }

  statusClass(status: string = ''): string {
    return 'status-' + status.toLowerCase();
  }
}
