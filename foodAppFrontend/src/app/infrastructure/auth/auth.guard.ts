import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = authService.user$.getValue();

  if (!user.username) {
    router.navigate(['/login']);
    return false;
  }

  const requiredRole: string | undefined = route.data?.['role'];
  if (requiredRole && user.role.toLowerCase() !== requiredRole.toLowerCase()) {
    router.navigate(['/home']);
    return false;
  }

  return true;
};
