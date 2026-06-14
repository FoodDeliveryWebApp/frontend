import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../auth.service';
import { Registration } from '../model/registration.model';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.css'
})
export class RegistrationComponent {
  loading = false;
  errorMsg: string | null = null;

  registrationForm = new FormGroup({
    name:     new FormControl('', [Validators.required]),
    surname:  new FormControl('', [Validators.required]),
    email:    new FormControl('', [Validators.required, Validators.email]),
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    phone:    new FormControl('', [
      Validators.required,
      Validators.pattern(/^\+?[0-9]{7,15}$/),
    ]),
  });

  constructor(private authService: AuthService, private router: Router) {}

  allowOnlyDigits(event: KeyboardEvent): void {
    const nav = ['Backspace','Delete','Tab','Escape','Enter','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'];
    if (nav.includes(event.key)) return;
    if (event.ctrlKey || event.metaKey) return;
    if (event.key === '+' && (event.target as HTMLInputElement).selectionStart === 0) return;
    if (!/^[0-9]$/.test(event.key)) event.preventDefault();
  }

  register(): void {
    if (!this.registrationForm.valid) {
      this.registrationForm.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.errorMsg = null;
    const v = this.registrationForm.value;
    const registration: Registration = {
      name: v.name!,
      surname: v.surname!,
      email: v.email!,
      username: v.username!,
      password: v.password!,
      phone: v.phone!,
    };
    this.authService.register(registration).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/home']);
      },
      error: () => {
        this.loading = false;
        this.errorMsg = 'Registration failed. Username or email may already be in use.';
      }
    });
  }
}
