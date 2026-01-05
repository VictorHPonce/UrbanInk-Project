import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { AuthStore } from '@features/auth/auth.store';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthStore);
  const router = inject(Router);

  const expectedRole = route.data['role'] as string;
  const user = auth.user();

  // 1. Verificamos Auth y existencia de Usuario
  if (!auth.isAuthenticated() || !user) {
    return router.createUrlTree(['/auth/login']);
  }

  // 2. PROTECCIÓN EXTRA: Verificamos si el usuario tiene rol definido
  // Usamos el operador ?. (Optional Chaining) para evitar el crash
  const userRole = user.role; 

  if (!userRole) {
    console.error('Error de Seguridad: El usuario no tiene rol asignado en el token.');
    return router.createUrlTree(['/']);
  }

  // 3. Comparación Segura
  if (userRole.toLowerCase() === expectedRole.toLowerCase()) {
    return true; 
  }

  // 4. Fallback
  alert('Acceso Denegado: Permisos insuficientes.');
  return router.createUrlTree(['/']);
};