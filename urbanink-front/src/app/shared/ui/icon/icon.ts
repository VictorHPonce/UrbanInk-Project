import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { APP_ICONS } from '../icons/icons.data';

@Component({
  selector: 'app-icon',
  imports: [CommonModule],
  templateUrl: './icon.html',
  styleUrl: './icon.css',
})
export class Icon {
// Inputs requeridos
  name = input.required<string>();
  class = input<string>('w-5 h-5'); // Clase por defecto

  // Computed: Busca el path en el diccionario
  path = computed(() => {
    const iconName = this.name();
    const path = APP_ICONS[iconName];
    if (!path) {
      console.warn(`Icono "${iconName}" no encontrado.`);
      return '';
    }
    return path;
  });
}