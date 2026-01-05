import { HttpInterceptorFn, HttpRequest, HttpHandler } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { AuthStore } from '@features/auth/auth.store';
import { catchError, switchMap, throwError } from 'rxjs';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(AuthStore);
  const authService = inject(AuthService);

  const token = authStore.token();
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError(err => {
      if (err.status === 401 && authStore.refreshToken()) {
        // Intentar refrescar token
        return authService.refreshToken(authStore.refreshToken()!).pipe(
          switchMap(() => {
            const newToken = authStore.token();
            const retryReq = req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } });
            return next(retryReq);
          }),
          catchError(() => {
            authStore.logout();
            return throwError(() => err);
          })
        );
      }

      if (err.status === 401) {
        authStore.logout();
      }
      return throwError(() => err);
    })
  );
};
