import { CurrencyPipe } from '@angular/common';
import { Component, EventEmitter, input, Input, output, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '@shared/models/product.model';

@Component({
  selector: 'app-product-card',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCard {
  product = input.required<Product>();
  addToCart = output<Product>();
}