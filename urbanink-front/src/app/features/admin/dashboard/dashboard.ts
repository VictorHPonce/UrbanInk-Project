import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { StatCard } from '../components/stat-card/stat-card';
import { DashboardService } from '../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, StatCard],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
private dashboardService = inject(DashboardService);

  // Observables directos (Patrón declarativo)
  stats$ = this.dashboardService.getStats();
  orders$ = this.dashboardService.getRecentOrders();

  // Helper para colores de estado
  getStatusColor(status: string): string {
    switch (status) {
      case 'Completed': return 'bg-emerald-100 text-emerald-700';
      case 'Pending': return 'bg-amber-100 text-amber-700';
      case 'Cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }
}