import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../infrastructure/auth/auth.service';
import { User } from '../../infrastructure/auth/model/user.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  user: User = { id: 0, username: '', role: '' };

  constructor(public authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService.user$.subscribe(u => this.user = u);
  }

  get isLoggedIn(): boolean { return !!this.user.username; }
  get role(): string { return this.user.role?.toLowerCase() ?? ''; }

  navigateToDashboard(): void {
    switch (this.role) {
      case 'worker': this.router.navigate(['/worker']); break;
      case 'deliveryman': this.router.navigate(['/delivery']); break;
      case 'manager': this.router.navigate(['/manager']); break;
      case 'administrator': this.router.navigate(['/admin']); break;
      default: this.router.navigate(['/home']);
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
