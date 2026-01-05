import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CartStore } from '@core/store/cart.store';
import { AuthStore } from '@features/auth/auth.store';


@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
// Inyectamos el Store
  readonly authStore = inject(AuthStore);
  readonly cartStore = inject(CartStore);
  
  // Estado local para menú móvil
  isMobileMenuOpen = signal(false);

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(v => !v);
  }

  logout() {
    this.authStore.logout();
    this.isMobileMenuOpen.set(false);
  }
}