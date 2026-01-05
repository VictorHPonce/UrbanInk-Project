import { computed, effect } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState, withHooks } from '@ngrx/signals';
import { CartItem } from '@shared/models/cart.model';
import { Product } from '@shared/models/product.model';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

const initialState: CartState = {
  items: [],
  isOpen: false
};

const CART_STORAGE_KEY = 'urban_ink_cart';
// Configuración de Negocio (En UI Optimista)
const FREE_SHIPPING_THRESHOLD = 100;
const SHIPPING_COST = 5.99;

export const CartStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  withComputed(({ items }) => {
    // 1. Subtotal (Suma de productos)
    const subTotal = computed(() => items().reduce((acc, item) => acc + (item.product.price * item.quantity), 0));
    
    // 2. Coste de Envío (Calculado aquí, no en el HTML)
    const shippingCost = computed(() => subTotal() >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST);
    
    // 3. Total Final
    const totalAmount = computed(() => subTotal() + shippingCost());

    // 4. Cantidad de Items
    const count = computed(() => items().reduce((acc, item) => acc + item.quantity, 0));

    // 5. Delta para envío gratis (Para la barra de progreso o mensaje)
    const freeShippingDelta = computed(() => Math.max(0, FREE_SHIPPING_THRESHOLD - subTotal()));

    return { subTotal, shippingCost, totalAmount, count, freeShippingDelta };
  }),

  withMethods((store) => ({
    addToCart(product: Product) {
      const currentItems = store.items();
      const existingItem = currentItems.find(i => i.product.id === product.id);

      if (existingItem) {
        // Validación de Stock
        if (existingItem.quantity < product.stock) {
             patchState(store, {
                items: currentItems.map(i =>
                    i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
                )
             });
        }
      } else {
        patchState(store, {
          items: [...currentItems, { product, quantity: 1 }]
        });
      }
      this.openCart();
    },

    removeFromCart(productId: number) {
      patchState(store, { items: store.items().filter(i => i.product.id !== productId) });
    },

    updateQuantity(productId: number, quantity: number) {
      const item = store.items().find(i => i.product.id === productId);
      if (!item) return;

      // Borrar si es 0
      if (quantity <= 0) {
        this.removeFromCart(productId);
        return;
      }

      // Validar Stock Máximo
      if (quantity > item.product.stock) return;

      patchState(store, {
        items: store.items().map(i => i.product.id === productId ? { ...i, quantity } : i)
      });
    },

    openCart: () => patchState(store, { isOpen: true }),
    closeCart: () => patchState(store, { isOpen: false }),
    toggleCart: () => patchState(store, { isOpen: !store.isOpen() }),
    
    clearCart() {
      patchState(store, { items: [] });
    }
  })),

  withHooks({
    onInit(store) {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        try {
          patchState(store, { items: JSON.parse(savedCart) });
        } catch (e) {
          console.error('Error cargando carrito', e);
        }
      }
      effect(() => {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(store.items()));
      });
    }
  })
);