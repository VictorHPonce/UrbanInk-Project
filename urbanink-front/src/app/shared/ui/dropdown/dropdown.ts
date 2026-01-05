import { Component, inject, signal } from '@angular/core';
import { AuthStore } from '@features/auth/auth.store';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dropdown',
  imports: [],
  templateUrl: './dropdown.html',
  styleUrl: './dropdown.css',
})
export class Dropdown {
  auth = inject(AuthStore);
  router = inject(Router);

  open = signal(false);

  toggle() {
    this.open.update(isOpen => !isOpen);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }
}
