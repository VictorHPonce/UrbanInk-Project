import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';

export interface DesignElement {
  id: number;
  imageUrl: string;
  x: number;
  y: number;
  scale: number; // 🔥 Nuevo: Control de tamaño
}

interface CustomizerState {
  shirtColor: string;
  activeDesign: DesignElement | null;
}

export const CustomizerStore = signalStore(
  withState<CustomizerState>({
    shirtColor: '#ffffff',
    activeDesign: null,
  }),
  withMethods((store) => ({
    setShirtColor(color: string) {
      patchState(store, { shirtColor: color });
    },
    
    // Seleccionar diseño (Resetear posición al centro por defecto)
    selectDesign(imageUrl: string) {
      if (!imageUrl) {
        patchState(store, { activeDesign: null });
        return;
      }
      patchState(store, { 
        activeDesign: { 
          id: Date.now(), 
          imageUrl, 
          x: 80, // Posición inicial segura
          y: 100, 
          scale: 1 // Tamaño original
        } 
      });
    },

    updatePosition(x: number, y: number) {
      const current = store.activeDesign();
      if (current) patchState(store, { activeDesign: { ...current, x, y } });
    },

    updateScale(scale: number) {
      const current = store.activeDesign();
      if (current) patchState(store, { activeDesign: { ...current, scale } });
    },

    // 🔥 ZONAS INTELIGENTES (La clave para que sea "Pro y Sencillo")
    applyZone(zone: 'pocket' | 'center' | 'full') {
      const current = store.activeDesign();
      if (!current) return;

      switch(zone) {
        case 'pocket': // Logo en el corazón
          patchState(store, { activeDesign: { ...current, x: 160, y: 80, scale: 0.6 } });
          break;
        case 'center': // Logo central estándar
          patchState(store, { activeDesign: { ...current, x: 90, y: 120, scale: 1.2 } });
          break;
        case 'full': // Diseño grande frontal
          patchState(store, { activeDesign: { ...current, x: 40, y: 60, scale: 2.0 } });
          break;
      }
    }
  }))
);