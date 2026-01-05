import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';

export interface DashboardStats {
  totalRevenue: number;
  ordersCount: number;
  productsCount: number;
  lowStockCount: number;
}

export interface RecentOrder {
  id: string;
  customer: string;
  total: number;
  status: 'Pending' | 'Completed' | 'Cancelled';
  date: Date;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  
  // Simular llamada a API /api/admin/stats
  getStats(): Observable<DashboardStats> {
    return of({
      totalRevenue: 12540.50,
      ordersCount: 342,
      productsCount: 45,
      lowStockCount: 3
    }).pipe(delay(800)); // Simulamos latencia de red
  }

  // Simular llamada a API /api/admin/orders/recent
  getRecentOrders(): Observable<RecentOrder[]> {
    return of([
      { id: '#ORD-001', customer: 'Alex Dev', total: 120.50, status: 'Completed', date: new Date() },
      { id: '#ORD-002', customer: 'Maria UI', total: 45.00, status: 'Pending', date: new Date() },
      { id: '#ORD-003', customer: 'John .NET', total: 250.00, status: 'Completed', date: new Date() },
      { id: '#ORD-004', customer: 'Sarah QA', total: 89.90, status: 'Cancelled', date: new Date() },
    ] as RecentOrder[]).pipe(delay(1000));
  }
}