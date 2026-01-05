import { CommonModule } from '@angular/common';
import { Component, inject, input, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastStore } from '@core/store/toast.store';
import { AdminProductsService } from '@features/admin/services/admin-products.service';
import { PRODUCT_CATEGORIES } from '@shared/constants/product.constants';
import { Icon } from '@shared/ui/icon/icon';

@Component({
  selector: 'app-product-form',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, Icon],
  templateUrl: './product-form.html',
  styleUrl: './product-form.css',
})
export class ProductForm {
// Servicios
  private fb = inject(FormBuilder);
  private adminService = inject(AdminProductsService);
  private router = inject(Router);
  private toast = inject(ToastStore);

  categories = PRODUCT_CATEGORIES;

  // 1. INPUT BINDING (Angular 18+): Recibe el id de la URL automáticamente
  // Si la ruta es /new, id será undefined. Si es /edit/5, será "5".
  id = input<string>(); 

  // 2. FORMULARIO REACTIVO
  form!: FormGroup;
  
  // 3. ESTADO LOCAL
  isEditMode = signal(false);
  isLoading = signal(false);
  imagePreview = signal<string | null>(null); // Para mostrar la foto seleccionada
  selectedFile: File | null = null; // El archivo real a subir

  constructor() {
    this.initForm();
  }

  ngOnInit() {
    // Si hay ID, activamos modo edición y cargamos datos
    if (this.id()) {
      this.isEditMode.set(true);
      this.loadProductData(Number(this.id()));
    }
  }

  // --- CONFIGURACIÓN DEL FORMULARIO ---
  private initForm() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      price: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      category: ['', Validators.required],
      description: ['', Validators.required],
      // La imagen no la gestiona FormControl directamente, sino el evento change
    });
  }

  // --- CARGA DE DATOS (SOLO EDICIÓN) ---
  private loadProductData(id: number) {
    this.isLoading.set(true);
    this.adminService.getProductById(id).subscribe({
      next: (product) => {
        const categoryExists = this.categories.some(c => c.value === product.category);
        // patchValue rellena el formulario automáticamente coincidiendo nombres
        this.form.patchValue({
          ...product,
          category: categoryExists ? product.category : '',
        })
        this.imagePreview.set(product.imageUrl); // Mostrar imagen actual
        this.isLoading.set(false);
      },
      error: () => {
        this.toast.show('Error cargando producto', 'error');
        this.router.navigate(['/admin/products']);
      }
    });
  }

  // --- MANEJO DE IMAGEN (PREVIEW) ---
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedFile = file;

      // Generar preview local
      const reader = new FileReader();
      reader.onload = () => this.imagePreview.set(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  // --- GUARDADO (SUBMIT) ---
  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched(); // Marcar rojos los errores
      return;
    }

    this.isLoading.set(true);

    // 1. Preparamos el FormData (Necesario para enviar archivos)
    const formData = new FormData();
    Object.keys(this.form.value).forEach(key => {
      formData.append(key, this.form.get(key)?.value);
    });

    // Si seleccionó imagen nueva, la añadimos
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    // 2. Decidir si es Crear o Editar
    const request$ = this.isEditMode()
      ? this.adminService.updateProduct(Number(this.id()), formData)
      : this.adminService.createProduct(formData);

    this.form.disable();
    this.isLoading.set(true);

    // 3. Ejecutar petición
    request$.subscribe({
      next: () => {
        this.toast.show(
          `Producto ${this.isEditMode() ? 'actualizado' : 'creado'} con éxito`, 
          'success'
        );
        this.router.navigate(['/admin/products']);
      },
      error: () => {
        this.form.enable();
        this.isLoading.set(false);
        this.toast.show('Ocurrió un error al guardar', 'error');
        this.isLoading.set(false);
      }
    });
  }
}