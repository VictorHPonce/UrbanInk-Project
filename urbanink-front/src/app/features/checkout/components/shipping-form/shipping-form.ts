import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AddressDto } from '@core/services/address.service';
import { Icon } from '@shared/ui/icon/icon';

@Component({
  selector: 'app-shipping-form',
  imports: [CommonModule, ReactiveFormsModule, Icon],
  templateUrl: './shipping-form.html',
  styleUrl: './shipping-form.css',
})
export class ShippingForm { 
parentForm = input.required<FormGroup>();
  groupName = input<string>('shipping');
  savedAddresses = input<AddressDto[]>([]);
  isNewMode = input<boolean>(false);

  modeChanged = output<void>();
  selectAddress = output<AddressDto>();

  // Opciones para el selector
  addressTypes = [
    { value: 0, label: 'Casa', icon: 'home' },
    { value: 1, label: 'Trabajo', icon: 'briefcase' },
    { value: 2, label: 'Otro', icon: 'map-pin' }
  ];

  get currentGroup(): FormGroup {
    return this.parentForm().get(this.groupName()) as FormGroup;
  }

  toggleMode() {
    this.modeChanged.emit();
  }

  onSelectAddress(addr: AddressDto) {
    this.selectAddress.emit(addr);
  }

  isSelected(addr: AddressDto): boolean {
    const currentVal = this.currentGroup.value;
    return currentVal.address === addr.street && currentVal.city === addr.city;
  }

  // Método auxiliar para obtener el alias seleccionado en el formulario
  get currentAlias() {
    return this.currentGroup.get('alias')?.value;
  }
  
  // Método para cambiar el alias desde los botones
  setAlias(value: number) {
    this.currentGroup.get('alias')?.setValue(value);
  }

  getAddressStyle(alias: number) {
    switch(alias) {
      case 0: return { label: 'Casa', icon: 'home', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
      case 1: return { label: 'Trabajo', icon: 'briefcase', bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' };
      default: return { label: 'Otro', icon: 'map-pin', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
    }
  }
}