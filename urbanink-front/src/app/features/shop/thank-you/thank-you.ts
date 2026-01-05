import { CommonModule } from '@angular/common';
import { Component, inject, input, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Location as AngularLocation } from '@angular/common';

@Component({
  selector: 'app-thank-you',
  imports: [CommonModule, RouterLink],
  templateUrl: './thank-you.html',
  styleUrl: './thank-you.css',
})
export class ThankYou implements OnInit {
  private location = inject(AngularLocation);

  orderId = input<string>();
  orderDetails: any = null;

  ngOnInit() {
    const state = this.location.getState() as { order: any, items: any[], total: number } | undefined;

    if (state && state.items) {
      this.orderDetails = state;
    } else {
      console.log('No se encontró estado de navegación (posible recarga de página).');
    }
  }
}