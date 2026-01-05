import { Component, inject, signal } from '@angular/core';
import { Dropdown } from '@shared/ui/dropdown/dropdown';
import { RouterLink } from '@angular/router';
import { AuthStore } from '@features/auth/auth.store';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, Dropdown],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  auth = inject(AuthStore);
  mobileOpen = signal(false);

  toggleMobile() {
    this.mobileOpen.update(open => !open);
  }
}
