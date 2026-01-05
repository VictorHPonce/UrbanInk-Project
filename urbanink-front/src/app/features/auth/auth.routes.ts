import { Routes } from '@angular/router';
import { guestGuard } from '@core/guards/guest.guard';

export const AUTH_ROUTES: Routes = [
  { path: 'login', loadComponent: () => import('./login/login-page/login-page').then(m => m.LoginPage), canActivate: [guestGuard] },
];
