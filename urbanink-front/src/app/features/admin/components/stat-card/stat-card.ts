import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  imports: [CommonModule],
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.css',
})
export class StatCard {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) value!: string | number;
  @Input() trend?: number;
  @Input() type: 'primary' | 'success' | 'warning' | 'danger' = 'primary';

  // Getter para calcular clases dinámicas basadas en el tipo
  get iconBgColor() {
    const map = {
      primary: 'bg-indigo-50 text-indigo-600',
      success: 'bg-emerald-50 text-emerald-600',
      warning: 'bg-amber-50 text-amber-600',
      danger: 'bg-red-50 text-red-600'
    };
    return map[this.type];
  }
}