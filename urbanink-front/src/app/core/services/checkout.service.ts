import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';

// Tipado de lo que enviamos (Coincide con C# CreateOrderDto)
export interface CreateOrderDto {
  customerEmail: string;
  customerName: string;
  address: string;
  city: string;
  zipCode: string;
  items: { productId: number; quantity: number }[];
}

// Tipado de la respuesta
export interface OrderResponse {
  message: string;
  orderId: number;
  total: number;
}

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/orders`;

  placeOrder(orderData: CreateOrderDto): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(this.apiUrl, orderData);
  }
}