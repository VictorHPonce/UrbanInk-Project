import { Component, input } from '@angular/core';

@Component({
  selector: 'app-alerts',
  imports: [],
  templateUrl: './alerts.html',
  styleUrl: './alerts.css',
})
export class Alerts {
  type = input<'error' | 'warning' | 'info' | 'success'>('info');
  message = input<string>('');
}
