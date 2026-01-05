import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';

export interface AddressDto {
  id: number;
  alias: number;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  phoneNumber?: string;
}

export interface CreateAddressDto {
  alias: number;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  phoneNumber?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/user/addresses`;

  getMyAddresses(): Observable<AddressDto[]> {
    return this.http.get<AddressDto[]>(this.apiUrl);
  }

  createAddress(address: CreateAddressDto): Observable<AddressDto> {
    return this.http.post<AddressDto>(this.apiUrl, address);
  }
}