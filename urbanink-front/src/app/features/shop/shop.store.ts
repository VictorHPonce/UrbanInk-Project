import { inject, computed } from '@angular/core';
import { patchState, signalStore, withHooks, withMethods, withState, withComputed } from '@ngrx/signals';
import { Product } from '@shared/models/product.model';
import { ProductsService } from '@core/services/products.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { ProductFilter } from '@shared/models/filter.model';


interface ShopState {
  products: Product[];
  filter: ProductFilter; // Objeto complejo en lugar de propiedades sueltas
  isLoading: boolean;
}

const initialState: ShopState = {
  products: [],
  filter: {
    search: '',
    category: null,
    onlyAvailable: false,
    sort: 'newest'
  },
  isLoading: true,
};

export const ShopStore = signalStore(
  withState(initialState),

  // 2. STATE DERIVADO (COMPUTED)
  // [Concepto]: Estos valores se recalculan AUTOMÁTICAMENTE solo cuando cambia
  // alguna dependencia (products o filter). Es como un Excel: si cambias la celda A,
  // la celda B que depende de ella se actualiza sola. Eficiencia pura.
  withComputed(({ products, filter }) => ({
    
    filteredProducts: computed(() => {
      const { search, category, onlyAvailable, sort } = filter();
      
      // Creamos una copia superficial para no mutar el estado original al ordenar
      let result = [...products()];

      // A) Filtro de Texto
      if (search) {
        const q = search.toLowerCase();
        result = result.filter(p => p.name.toLowerCase().includes(q));
      }

      // B) Filtro de Categoría
      if (category) {
        result = result.filter(p => p.category === category);
      }

      // C) Filtro de Disponibilidad
      if (onlyAvailable) {
        result = result.filter(p => p.stock > 0);
      }

      // D) Ordenación
      // Nota: 'newest' suele ser el orden por defecto del backend o ID desc
      switch (sort) {
        case 'price_asc':
          result.sort((a, b) => a.price - b.price);
          break;
        case 'price_desc':
          result.sort((a, b) => b.price - a.price);
          break;
        // case 'newest': result.sort(...) 
      }

      return result;
    })
  })),

  withMethods((store, productService = inject(ProductsService)) => ({
    
    // Actualización parcial del filtro
    // Permite cambiar solo el buscador, o solo el sort, sin borrar el resto.
    updateFilter(newFilter: Partial<ProductFilter>) {
      patchState(store, (state) => ({
        filter: { ...state.filter, ...newFilter }
      }));
    },

    // 3. EFECTOS ASÍNCRONOS (RxMethod)
    // [Concepto]: SignalStore es síncrono por naturaleza. Para llamar a APIs
    // (que son asíncronas/Observables), usamos `rxMethod`.
    // Esto conecta el mundo Reactivo de RxJS con el mundo de Signals.
    loadProducts: rxMethod<void>(
      pipe(
        // Antes de llamar, indicamos que estamos cargando
        tap(() => patchState(store, { isLoading: true })),
        
        // Cancelación automática: Si llamamos a loadProducts de nuevo rápido,
        // switchMap cancela la petición anterior.
        switchMap(() => productService.getProducts()),
        
        // Al recibir respuesta, actualizamos estado
        tap((products) => {
          patchState(store, { 
            products, 
            isLoading: false 
          });
        })
      )
    )
  })),

  // 4. CICLO DE VIDA
  // Se ejecuta automáticamente cuando el componente que usa este Store se monta.
  withHooks({
    onInit(store) {
      store.loadProducts();
    }
  })
);