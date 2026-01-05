import { Component, inject } from '@angular/core';
import { ShopStore } from '../shop.store';
import { ProductCard } from '../components/product-card/product-card';
import { CartStore } from '@core/store/cart.store';
import { Product } from '@shared/models/product.model';
import { ProductFilters } from '../components/product-filters/product-filters';
import { ProductFilter } from '@shared/models/filter.model';

@Component({
  selector: 'app-shop-page',
  standalone: true,
  providers: [ShopStore], // El store nace y muere con este componente
  imports: [ProductCard, ProductFilters],
  templateUrl: './shop-page.html',
  styleUrls: ['./shop-page.css'],
})
export class ShopPage {
 // Inyecciones
  readonly shopStore = inject(ShopStore);
  readonly cartStore = inject(CartStore);

  // 1. Manejo de Filtros
  // Cuando el hijo emite un cambio (texto, cat, sort...), actualizamos el Store.
  onFilterChange(filter: ProductFilter) {
    this.shopStore.updateFilter(filter);
  }

  // 2. Manejo de Carrito
  onAddToCart(product: Product) {
    this.cartStore.addToCart(product);
  }
}