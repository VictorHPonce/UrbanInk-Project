import { Routes } from '@angular/router';
import { PublicLayout } from './shared/components/layouts/public-layout/public-layout';
import { guestGuard } from '@core/guards/guest.guard';
import { roleGuard } from '@core/guards/role.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('@features/auth/auth.routes').then(m => m.AUTH_ROUTES),
    canActivate: [guestGuard]
  },
  {
    path: 'admin',
    loadChildren: () => import('@features/admin/admin.routes').then(m => m.ADMIN_ROUTES),
    canActivate: [roleGuard],
    data: { role: 'Admin' }
  },
  {
    path: '',
    component: PublicLayout,
    children: [
      { path: '', redirectTo: 'shop', pathMatch: 'full' },

      {
        path: 'shop',
        loadComponent: () => import('@features/shop/shop-page/shop-page').then(m => m.ShopPage)
      },
      {
        path: 'customizer',
        loadComponent: () => import('@features/customizer/customizer').then(m => m.Customizer)
      },
      {
        path: 'checkout',
        loadComponent: () => import('@features/checkout/checkout-page/checkout-page').then(m => m.CheckoutPage)
      }
    ]
  },

  { path: '**', redirectTo: 'shop' }
];