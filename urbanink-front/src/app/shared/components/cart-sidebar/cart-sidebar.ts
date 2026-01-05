import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartStore } from '@core/store/cart.store';

@Component({
  selector: 'app-cart-sidebar',
  imports: [CommonModule, RouterLink],
  templateUrl: './cart-sidebar.html',
  styleUrl: './cart-sidebar.css',
})
export class CartSidebar {
  readonly store = inject(CartStore);
}
