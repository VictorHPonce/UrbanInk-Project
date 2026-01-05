import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-admin-layout',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
})
export class AdminLayout {
private router = inject(Router);

  // 1. SIGNAL PARA EL ESTADO
  // false = cerrado por defecto (ideal para móvil)
  // En desktop, CSS controla la visibilidad, así que este estado solo afecta al móvil
  isSidebarOpen = signal(false);

  constructor() {
    // 2. UX AUTOMÁTICA
    // Escuchamos los cambios de ruta. Cuando el usuario navega a otra página,
    // cerramos el menú móvil automáticamente.
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.isSidebarOpen.set(false);
    });
  }
}