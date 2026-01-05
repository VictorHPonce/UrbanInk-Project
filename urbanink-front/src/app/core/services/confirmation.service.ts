import { Injectable, signal } from '@angular/core';

export interface ConfirmationOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'info' | 'warning';
}

@Injectable({ providedIn: 'root' })
export class ConfirmationService {
  // 1. Estado Reactivo (Signals) para la UI
  isOpen = signal(false);
  options = signal<ConfirmationOptions>({
    title: 'Confirmación',
    message: '',
    confirmText: 'Aceptar',
    cancelText: 'Cancelar',
    type: 'info'
  });

  // 2. Variable privada para guardar la "llave" de la promesa
  private resolveRef: ((result: boolean) => void) | null = null;

  // 3. El método que llamarás desde tus componentes
  confirm(opts: ConfirmationOptions): Promise<boolean> {
    this.options.set({
      confirmText: 'Sí, continuar',
      cancelText: 'Cancelar',
      type: 'info', // Valor por defecto
      ...opts // Sobrescribe con lo que mandes
    });
    
    this.isOpen.set(true);

    // Retornamos una promesa que se resolverá en el futuro
    return new Promise<boolean>((resolve) => {
      this.resolveRef = resolve;
    });
  }

  // Métodos internos para los botones del HTML
  accept() {
    if (this.resolveRef) this.resolveRef(true);
    this.close();
  }

  cancel() {
    if (this.resolveRef) this.resolveRef(false);
    this.close();
  }

  private close() {
    this.isOpen.set(false);
    this.resolveRef = null;
  }
}