import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appTilt]',
  standalone: true
})
export class TiltDirective {
  @Input() tiltLimit = 10; // Grados máximos de inclinación

  constructor(private el: ElementRef, private renderer: Renderer2) {
    // Configuración inicial para suavidad
    this.renderer.setStyle(this.el.nativeElement, 'transition', 'transform 0.1s ease-out');
    this.renderer.setStyle(this.el.nativeElement, 'transform-style', 'preserve-3d');
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    const rect = this.el.nativeElement.getBoundingClientRect();
    
    // Calcular posición del mouse relativa al centro del elemento
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calcular rotación
    const rotateX = ((y - centerY) / centerY) * -this.tiltLimit; // Invertido
    const rotateY = ((x - centerX) / centerX) * this.tiltLimit;

    // Aplicar transformación 3D
    this.renderer.setStyle(
      this.el.nativeElement,
      'transform',
      `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale(1.02)`
    );
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    // Volver a la posición original suavemente
    this.renderer.setStyle(this.el.nativeElement, 'transition', 'transform 0.5s ease-out');
    this.renderer.setStyle(this.el.nativeElement, 'transform', 'perspective(1000px) rotateX(0) rotateY(0) scale(1)');
  }
}