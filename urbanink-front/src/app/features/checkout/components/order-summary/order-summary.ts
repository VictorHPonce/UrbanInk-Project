import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartStore } from '@core/store/cart.store';
import { Icon } from '@shared/ui/icon/icon';

@Component({
  selector: 'app-order-summary',
  imports: [CommonModule, RouterLink, Icon],
  templateUrl: './order-summary.html',
  styleUrl: './order-summary.css',
})
export class OrderSummary {
  cartStore = inject(CartStore);
}
