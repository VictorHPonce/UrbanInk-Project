import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '@env/environment';
import { tap } from 'rxjs/operators';

// 1. Interfaces que coinciden con tu Backend
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phoneNumber?: string; // El campo nuevo que añadimos
}

export interface AuthResponse {
  user: User; // Tu backend devuelve esto, ¡aprovéchalo!
  accessToken: string;
  refreshToken: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/auth`;

  // 2. El Estado (Signal)
  // Inicialmente es null. Si hay algo en localStorage, lo cargamos.
  currentUser = signal<User | null>(this.getUserFromStorage());

  constructor() {
    // Opcional: Podrías validar si el token expiró aquí, 
    // pero por ahora confiamos en el localStorage básico.
  }

  // 3. Login mejorado
  login(email: string, password: string) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(response => {
          // A) Guardamos Tokens
          localStorage.setItem('access_token', response.accessToken);
          localStorage.setItem('refresh_token', response.refreshToken);
          
          // B) Guardamos Usuario (Estado + Persistencia)
          this.saveUserToStorage(response.user);
          this.currentUser.set(response.user);
        })
      );
  }

  // Refrescar token (se mantiene similar)
  refreshToken(refreshToken: string) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh`, { refreshToken })
      .pipe(
        tap(response => {
           localStorage.setItem('access_token', response.accessToken);
           localStorage.setItem('refresh_token', response.refreshToken);
           // El refresh también puede devolver usuario actualizado
           if (response.user) {
             this.saveUserToStorage(response.user);
             this.currentUser.set(response.user);
           }
        })
      );
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('urban_ink_user');
    this.currentUser.set(null);
  }

  // --- Helpers Privados ---

  private saveUserToStorage(user: User) {
    localStorage.setItem('urban_ink_user', JSON.stringify(user));
  }

  private getUserFromStorage(): User | null {
    const userJson = localStorage.getItem('urban_ink_user');
    return userJson ? JSON.parse(userJson) : null;
  }
}