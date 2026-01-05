import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Toast } from "@shared/components/toast/toast";
import { ConfirmationModal } from "@shared/components/confirmation-modal/confirmation-modal";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Toast, ConfirmationModal],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('urbanink-front');
}
