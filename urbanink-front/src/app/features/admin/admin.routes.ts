import { Routes } from '@angular/router';
import { AdminLayout } from './admin-layout/admin-layout';
import { Dashboard } from './dashboard/dashboard';


export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayout,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard').then(m => m.Dashboard)
      },
      {
        path: 'products',
        loadComponent: () => import('./products/products-list/products-list').then(m => m.ProductsList)
      },
      {
        path: 'products/new',
        loadComponent: () => import('./products/product-form/product-form').then(m => m.ProductForm)
      },
      {
        path: 'products/edit/:id',
        loadComponent: () => import('./products/product-form/product-form').then(m => m.ProductForm)
      }
    ]
  }
];

