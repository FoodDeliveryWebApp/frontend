import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { TokenStorage } from './jwt/token.service';
import { environment } from 'src/env/environment';
import { Login } from './model/login.model';
import { AuthenticationResponse } from './model/authentication-response.model';
import { User } from './model/user.model';
import { Registration } from './model/registration.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user$ = new BehaviorSubject<User>({ username: '', id: 0, role: '' });

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorage,
    private router: Router
  ) {}

  login(login: Login): Observable<AuthenticationResponse> {
    return this.http
      .post<AuthenticationResponse>(environment.apiHost + 'users/login', login)
      .pipe(
        tap((response) => {
          this.tokenStorage.saveAccessToken(response.accessToken);
          this.setUser();
        })
      );
  }

  register(registration: Registration): Observable<AuthenticationResponse> {
    return this.http
      .post<AuthenticationResponse>(environment.apiHost + 'users', registration)
      .pipe(
        tap((response) => {
          this.tokenStorage.saveAccessToken(response.accessToken);
          this.setUser();
        })
      );
  }

  logout(): void {
    this.router.navigate(['/home']).then(() => {
      this.tokenStorage.clear();
      this.user$.next({ username: '', id: 0, role: '' });
    });
  }

  checkIfUserExists(): void {
    const accessToken = this.tokenStorage.getAccessToken();
    if (accessToken == null) return;
    this.setUser();
  }

  private decodeToken(token: string): Record<string, unknown> | null {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  }

  private setUser(): void {
    const accessToken = this.tokenStorage.getAccessToken() || '';
    const decoded = this.decodeToken(accessToken);
    if (!decoded) return;
    const user: User = {
      id: +(decoded['id'] as string),
      username: decoded['username'] as string,
      role: decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] as string,
    };
    this.user$.next(user);
  }
}
