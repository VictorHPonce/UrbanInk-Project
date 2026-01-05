import { Routes } from '@angular/router';

export const SHOP_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./shop-page/shop-page').then(m => m.ShopPage) }
];
