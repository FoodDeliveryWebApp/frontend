import { HttpInterceptorFn } from '@angular/common/http';
import { ACCESS_TOKEN } from 'src/app/shared/constants';

export const jwtInterceptorFn: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem(ACCESS_TOKEN);
  if (token) {
    const cloned = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    return next(cloned);
  }
  return next(req);
};
