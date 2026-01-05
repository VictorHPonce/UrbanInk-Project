import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CartSidebar } from '@shared/components/cart-sidebar/cart-sidebar';
import { Header } from '@shared/components/header/header';


@Component({
  selector: 'app-public-layout',
  imports: [RouterOutlet, Header, CartSidebar],
  templateUrl: './public-layout.html',
  styleUrl: './public-layout.css',
})
export class PublicLayout {

}
