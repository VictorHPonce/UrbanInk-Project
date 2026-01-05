import { inject, computed } from '@angular/core';
import { signalStore, withState, withMethods, withComputed, patchState, withHooks } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { tapResponse } from '@ngrx/operators';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';
import { User } from './auth.models';
import { AuthService } from '../../core/services/auth.service';


// Ajusta esto a la respuesta real de tu backend
interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isLoading: false,
  error: null,
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  
  withComputed((store) => ({
    isAuthenticated: computed(() => !!store.token()),
    isAdmin: computed(() => store.user()?.role === 'Admin'),
  })),

  withMethods((store, authService = inject(AuthService), router = inject(Router)) => {
    
    // 1. Método PRIVADO/AUXILIAR para guardar sesión (Síncrono)
    // Este método se usa internamente cuando tenemos tokens válidos
    const setSession = (accessToken: string, refreshToken: string) => {
      try {
        const decoded: any = jwtDecode(accessToken);
        
        patchState(store, {
          token: accessToken,
          refreshToken,
          user: { id: decoded.id, email: decoded.email, role: decoded.role }, // Ajusta al payload de tu token
          isLoading: false,
          error: null
        });

        localStorage.setItem('token', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
      } catch (err) {
        console.error('Error decodificando token', err);
        // Si el token está corrupto, limpiamos todo
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      }
    };

    return {
      // Expuesto para poder restaurar sesión desde hooks u otros consumidores
      setSession,

      // 2. Método PÚBLICO para el Login (Asíncrono - rxMethod)
      // Este es el que llama tu componente con 1 argumento: { email, password }
      login: rxMethod<{email: string, password: string}>(pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(({ email, password }) => 
          authService.login(email, password).pipe(
            tapResponse({
              next: (response: LoginResponse) => {
                // Al tener éxito, llamamos al auxiliar para guardar estado
                setSession(response.accessToken, response.refreshToken);
                router.navigate(['/']); 
              },
              error: (err) => {
                console.error(err);
                patchState(store, { 
                  isLoading: false, 
                  error: 'Credenciales inválidas o error de conexión' 
                });
              }
            })
          )
        )
      )),

      logout() {
        patchState(store, { user: null, token: null, refreshToken: null, error: null });
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        router.navigate(['/auth/login']);
      }
    };
  }),

  // 3. Hooks para persistencia al recargar página
  withHooks({
    onInit(store) {
      const token = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (token && refreshToken) {
        // Restauramos la sesión inmediatamente
        store.setSession(token, refreshToken);
      }
    }
  })
);