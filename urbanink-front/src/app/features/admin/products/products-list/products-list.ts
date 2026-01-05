import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminProductsStore } from '../admin-products.store';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ToastStore } from '@core/store/toast.store';
import { Icon } from '@shared/ui/icon/icon';
import { ConfirmationService } from '@core/services/confirmation.service';

@Component({
  selector: 'app-products-list',
  imports: [CommonModule, RouterLink, ReactiveFormsModule, Icon],
  providers: [AdminProductsStore],
  templateUrl: './products-list.html',
  styleUrl: './products-list.css',
})
export class ProductsList {
  readonly store = inject(AdminProductsStore);
  private confirmation = inject(ConfirmationService);
  searchControl = new FormControl('');

  constructor() {
    // Conectar buscador con el store
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => {
      this.store.setSearch(value || '');
    });
  }

async onDelete(product: any) {
    
    // La forma profesional de pedir confirmación
    const confirmado = await this.confirmation.confirm({
      title: '¿Desactivar producto?',
      message: `El producto "${product.name}" dejará de ser visible en la tienda pública.`,
      confirmText: 'Sí, desactivar',
      cancelText: 'Cancelar',
      type: 'danger'
    });

    if (confirmado) {
      // Si dijo que SÍ, llamamos al store
      this.store.toggleStatus({ id: product.id, isActive: false });
    }
    
    // Si dijo que NO, no hacemos nada (el modal se cierra solo)
  }
}
