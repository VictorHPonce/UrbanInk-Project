import {
  signalStore,
  withState,
  withMethods,
  withComputed,
  patchState,
} from '@ngrx/signals';
import { computed } from '@angular/core';
import { Product } from '@shared/models/product.model';

export interface CartState {
  items: Product[];
}

export const CartStore = signalStore(
  { providedIn: 'root' },

  withState<CartState>({
    items: [],
  }),

  withComputed((state) => ({
    totalItems: computed(() => state.items().length),
    totalPrice: computed(() =>
      state.items().reduce((sum, item) => sum + item.price, 0)
    ),
  })),

  withMethods((store) => ({
    add(product: Product) {
      patchState(store, {
        items: [...store.items(), product],
      });
    },

    remove(id: number) {
      patchState(store, {
        items: store.items().filter(p => p.id !== id),
      });
    },

    clear() {
      patchState(store, {
        items: [],
      });
    }
  }))
);
