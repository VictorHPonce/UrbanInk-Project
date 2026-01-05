import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastState {
  toasts: Toast[];
}

const initialState: ToastState = {
  toasts: [],
};

export const ToastStore = signalStore(
  { providedIn: 'root' }, // Global, accesible desde toda la app
  withState(initialState),
  
  withMethods((store) => ({
    
    // Método para mostrar notificación
    show(message: string, type: ToastType = 'info') {
      const id = Date.now(); // ID único basado en tiempo
      
      const newToast: Toast = { id, message, type };

      // 1. Añadimos el toast al array
      patchState(store, { toasts: [...store.toasts(), newToast] });

      // 2. Programamos su autodestrucción en 3 segundos
      setTimeout(() => {
        this.remove(id);
      }, 3000);
    },

    // Método para quitarlo (manual o automático)
    remove(id: number) {
      patchState(store, { 
        toasts: store.toasts().filter(t => t.id !== id) 
      });
    }
  }))
);