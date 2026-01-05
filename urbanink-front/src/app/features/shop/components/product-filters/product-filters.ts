import { CommonModule } from '@angular/common';
import { Component, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ProductFilter } from '@shared/models/filter.model';
import { Icon } from '@shared/ui/icon/icon';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-product-filters',
  imports: [CommonModule, ReactiveFormsModule, Icon],
  templateUrl: './product-filters.html',
  styleUrl: './product-filters.css',
})
export class ProductFilters {
  filterChanged = output<ProductFilter>();

  // Lista de categorías (podría venir de un @Input si las cargas del backend)
  categories = ['ropa', 'accesorios', 'equipamiento', 'arte'];

  private destroy$ = new Subject<void>();

  filterForm = new FormBuilder().group({
    search: [''],
    category: [null as string | null], // Control manual para los botones
    sort: ['newest'],
    onlyAvailable: [false]
  });

  ngOnInit() {
    // Escuchamos cambios en todo el formulario
    this.filterForm.valueChanges
      .pipe(
        debounceTime(300), // Espera a que el usuario termine de escribir/clicar
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
        takeUntil(this.destroy$)
      )
      .subscribe(value => {
        // Emitimos el valor limpio y tipado al padre
        this.filterChanged.emit(value as ProductFilter);
      });
  }

  // Helper para los botones de categoría
  get currentCategory() {
    return this.filterForm.get('category')?.value;
  }

  setCategory(cat: string | null) {
    this.filterForm.patchValue({ category: cat });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}