import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { Product } from '@shared/models/product.model';
import { inject, computed } from '@angular/core';
import { AdminProductsService } from '../services/admin-products.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { ToastStore } from '@core/store/toast.store';

interface AdminProductsState {
  products: Product[];
  totalItems: number;
  currentPage: number;
  pageSize: number;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
}

const initialState: AdminProductsState = {
  products: [],
  totalItems: 0,
  currentPage: 1,
  pageSize: 10,
  searchQuery: '',
  isLoading: false,
  error: null,
};

export const AdminProductsStore = signalStore(
  withState(initialState),

  withComputed(({ totalItems, pageSize, currentPage }) => ({
    totalPages: computed(() => Math.ceil(totalItems() / pageSize())),
    startItem: computed(() => (currentPage() - 1) * pageSize() + 1),
    endItem: computed(() => Math.min(currentPage() * pageSize(), totalItems()))
  })),

  // INICIO DE WITHMETHODS
  withMethods((store, service = inject(AdminProductsService), toast = inject(ToastStore)) => ({

    // --- MÉTODO 1: Cargar Productos ---
    loadProducts: rxMethod<{ page?: number, search?: string }>(pipe(
      tap(() => patchState(store, { isLoading: true, error: null })),
      switchMap((params) => {
        const page = params.page ?? store.currentPage();
        const search = params.search ?? store.searchQuery();

        return service.getProducts(page, store.pageSize(), search).pipe(
          tapResponse({
            next: (response) => {
              patchState(store, {
                products: response.items,
                totalItems: response.totalItems,
                currentPage: page,
                isLoading: false
              });
            },
            error: (err) => patchState(store, { isLoading: false, error: 'Error cargando productos' })
          })
        );
      })
    )),

    setPage(page: number) {
      this.loadProducts({ page });
    },

    setSearch(query: string) {
      patchState(store, { searchQuery: query });
      this.loadProducts({ page: 1, search: query });
    },

    // --- MÉTODO 2: Borrado Lógico (Soft Delete) ---
    toggleStatus: rxMethod<{ id: number; isActive: boolean }>(pipe(
      switchMap(({ id, isActive }) => {

        // 1. Snapshot: Guardamos cómo estaba antes por si falla
        const previousProducts = store.products();

        // 2. Optimistic Update: Mentimos al usuario (para bien)
        // Actualizamos la UI inmediatamente sin esperar al servidor
        patchState(store, {
          products: previousProducts.map(p =>
            p.id === id ? { ...p, isActive: isActive } : p
          )
        });

        // 3. Llamada Real a la API
        return service.toggleActive(id, isActive).pipe(
          tapResponse({
            next: () => {
              toast.show(
                `Producto ${isActive ? 'activado' : 'desactivado'} correctamente`,
                'success'
              );
            },
            error: (err) => {
              // USO DEL TOAST ERROR
              patchState(store, { products: previousProducts }); // Rollback
              toast.show('Error de conexión. Se deshicieron los cambios.', 'error');
            }
          })
        );
      })
    ))

  })),

  withHooks({
    onInit(store) {
      store.loadProducts({});
    }
  })
);