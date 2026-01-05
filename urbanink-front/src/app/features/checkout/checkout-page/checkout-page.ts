import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CheckoutService, CreateOrderDto } from '@core/services/checkout.service';
import { AddressDto, AddressService } from '@core/services/address.service';
import { CartStore } from '@core/store/cart.store';
import { ToastStore } from '@core/store/toast.store';
import { lastValueFrom } from 'rxjs';
import { Icon } from "@shared/ui/icon/icon";
import { AuthService } from '@core/services/auth.service';
import { ShippingForm } from '../components/shipping-form/shipping-form';
import { OrderSummary } from '../components/order-summary/order-summary';


const FORM_STORAGE_KEY = 'urban_ink_checkout_form';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, Icon, ShippingForm, OrderSummary],
  templateUrl: './checkout-page.html',
  styleUrl: './checkout-page.css',
})
export class CheckoutPage implements OnInit {
private fb = inject(FormBuilder);
  private router = inject(Router);
  private checkoutService = inject(CheckoutService);
  private addressService = inject(AddressService);
  private authService = inject(AuthService);
  
  readonly cartStore = inject(CartStore);
  readonly toast = inject(ToastStore);

  isSubmitting = signal(false);
  savedAddresses = signal<AddressDto[]>([]); 
  isNewAddressMode = signal(true); 

  checkoutForm = this.fb.group({
    contact: this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{9,15}$')]]
    }),
    shipping: this.fb.group({
      alias: [0, Validators.required],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required]],
      address: ['', [Validators.required, Validators.minLength(5)]],
      city: ['', Validators.required],
      zipCode: ['', [Validators.required, Validators.pattern('^[0-9]{4,5}$')]],
      saveAddress: [false]
    })
  });

  get contact() { return this.checkoutForm.get('contact') as FormGroup; }

  constructor() {
     // EFFECT: Rellena datos automáticamente cuando el usuario carga
     effect(() => {
        const user = this.authService.currentUser();
        if (user) {
            this.checkoutForm.patchValue({
                contact: {
                    email: user.email,
                    phone: user.phoneNumber || ''
                },
                shipping: {
                    firstName: user.firstName,
                    lastName: user.lastName
                }
            }, { emitEvent: false });
        }
     });
  }

  ngOnInit() {
    // 1. Cargar Direcciones
    this.addressService.getMyAddresses().subscribe({
      next: (addresses) => {
        this.savedAddresses.set(addresses);
        if (addresses.length > 0) {
          this.isNewAddressMode.set(false);
          // Si no hay nada guardado en localstorage, pre-selecciona la primera
          if (!localStorage.getItem(FORM_STORAGE_KEY)) {
             const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
             this.selectAddress(defaultAddr);
          }
        }
      }
    });

    // 2. Recuperar form del LocalStorage (Opcional, si quieres persistencia)
    const savedForm = localStorage.getItem(FORM_STORAGE_KEY);
    if (savedForm) {
        try { this.checkoutForm.patchValue(JSON.parse(savedForm)); } catch {}
    }

    // 3. Autoguardado
    this.checkoutForm.valueChanges.subscribe(val => {
        const { saveAddress, ...rest } = val.shipping!;
        const toSave = { ...val, shipping: rest };
        localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(toSave));
    });
  }

  // --- MÉTODOS QUE LLAMARÁ EL HIJO ---

  toggleAddressMode() {
    this.isNewAddressMode.update(v => !v);
    
    // Si entramos a modo nueva, limpiamos dirección pero dejamos nombres
    if (this.isNewAddressMode()) {
       this.checkoutForm.get('shipping')?.reset();
       const user = this.authService.currentUser();
       if(user) {
          this.checkoutForm.get('shipping')?.patchValue({
             alias: 0,
             firstName: user?.firstName || '',
             lastName: user?.lastName || '',
             address: '',
             city: '',
             zipCode: '',
             saveAddress: true,
          });
       }
    }
  }

  selectAddress(addr: AddressDto) {
    this.isNewAddressMode.set(false);
    this.checkoutForm.get('shipping')?.patchValue({
      alias: addr.alias,
      firstName: '',
      lastName: '',
      address: addr.street,
      city: addr.city,
      zipCode: addr.postalCode,
      saveAddress: false // Si es existente, no guardar
    });
  }

  async onSubmit() {
    if (this.cartStore.items().length === 0) return;
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      this.toast.show('Revisa los campos obligatorios 🔴', 'error');
      return;
    }

    this.isSubmitting.set(true);
    const formValue = this.checkoutForm.value;

    // Lógica guardar dirección nueva (si aplica)
    if (this.isNewAddressMode() && formValue.shipping?.saveAddress) {
        try {
            const newAddress = {
                alias: 0,
                street: formValue.shipping.address!,
                city: formValue.shipping.city!,
                postalCode: formValue.shipping.zipCode!,
                country: 'España',
                isDefault: this.savedAddresses().length === 0,
                phoneNumber: formValue.contact?.phone || undefined // Opcional
            };
            await lastValueFrom(this.addressService.createAddress(newAddress));
        } catch(e) { console.error('Error guardando dirección', e); }
    }

    // Crear Pedido
    const orderData: CreateOrderDto = {
      customerEmail: formValue.contact!.email!,
      customerName: `${formValue.shipping!.firstName} ${formValue.shipping!.lastName}`,
      address: formValue.shipping!.address!,
      city: formValue.shipping!.city!,
      zipCode: formValue.shipping!.zipCode!,
      items: this.cartStore.items().map(item => ({
        productId: item.product.id,
        quantity: item.quantity
      }))
    };

    this.checkoutService.placeOrder(orderData).subscribe({
      next: (res) => {
        this.cartStore.clearCart();
        localStorage.removeItem(FORM_STORAGE_KEY);
        this.router.navigate(['/thank-you', res.orderId]);
      },
      error: (err) => {
        this.toast.show(err.error?.message || 'Error', 'error');
        this.isSubmitting.set(false);
      }
    });
  }
}