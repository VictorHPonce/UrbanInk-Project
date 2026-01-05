import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from '@shared/models/product.model';
import { environment } from '@env/environment';

// Interfaz para la respuesta paginada (La implementaremos en .NET luego)
export interface PagedResponse<T> {
  items: T[];
  totalItems: number;
  page: number;
  pageSize: number;
}

@Injectable({ providedIn: 'root' })
export class AdminProductsService {
  private http = inject(HttpClient);
  // Ajusta la URL si no usas environment aún: 'http://localhost:5000/api/products'
  private readonly API_URL = `${environment.apiUrl}/products`;

  // 1. OBTENER PRODUCTOS PAGINADOS
  getProducts(page: number = 1, pageSize: number = 10, search: string = ''): Observable<PagedResponse<Product>> {
    let params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);

    if (search) {
      params = params.set('search', search);
    }

    //  Apuntamos a /manage
    // Angular esperará { items: [...], totalItems: 50 } y .NET se lo dará.
    return this.http.get<PagedResponse<Product>>(`${this.API_URL}/manage`, { params });
  }

  // 2. CREAR (Usamos FormData para enviar Imagen + Datos JSON a la vez)
  createProduct(productData: FormData): Observable<Product> {
    return this.http.post<Product>(this.API_URL, productData);
  }

  // 3. EDITAR
  updateProduct(id: number, productData: FormData): Observable<Product> {
    return this.http.put<Product>(`${this.API_URL}/${id}`, productData);
  }

  // 4. SOFT DELETE (Desactivar)
  toggleActive(id: number, isActive: boolean): Observable<void> {
    return this.http.patch<void>(`${this.API_URL}/${id}/status`, { isActive });
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.API_URL}/manage/${id}`);
  }
}