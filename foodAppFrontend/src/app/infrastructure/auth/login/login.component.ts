import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../auth.service';
import { Login } from '../model/login.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loading = false;
  loginError: string | null = null;

  loginForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });

  constructor(private authService: AuthService, private router: Router) {}

  login(): void {
    if (!this.loginForm.valid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.loginError = null;
    const login: Login = {
      username: this.loginForm.value.username!,
      password: this.loginForm.value.password!,
    };
    this.authService.login(login).subscribe({
      next: () => {
        this.loading = false;
        const role = this.authService.user$.getValue().role?.toLowerCase();
        switch (role) {
          case 'worker': this.router.navigate(['/worker']); break;
          case 'deliveryman': this.router.navigate(['/delivery']); break;
          case 'manager': this.router.navigate(['/manager']); break;
          case 'administrator': this.router.navigate(['/admin']); break;
          default: this.router.navigate(['/home']);
        }
      },
      error: () => {
        this.loading = false;
        this.loginError = 'Invalid username or password.';
      }
    });
  }
}
