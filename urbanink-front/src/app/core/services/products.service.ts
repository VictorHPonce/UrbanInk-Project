import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Product } from '@shared/models/product.model';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class ProductsService {
    private http = inject(HttpClient);

    private readonly API_URL = `${environment.apiUrl}/products`;

    getProducts(): Observable<Product[]> {
        return this.http.get<Product[]>(this.API_URL).pipe(
            map(products => products.map(p => ({
                ...p,
                // Tu fallback de imagen está perfecto
                imageUrl: p.imageUrl || '/assets/stickers/skull.webp',
                // Aseguramos compatibilidad con el modelo de Frontend
                category: p.category || 'General',
                isAvailable: p.isAvailable ?? true // Si viene null, asumimos true o false
            })))
        );
    }
}