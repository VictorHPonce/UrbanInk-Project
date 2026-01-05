import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { CdkDrag, CdkDragEnd, CdkDropList, CdkDragDrop, CdkDragPreview, CdkDragPlaceholder } from '@angular/cdk/drag-drop';
import { CustomizerStore } from './customizer.store';
import { CommonModule } from '@angular/common';
import { ImageGeneratorService } from '@core/services/image-generator.service';
import { TiltDirective } from '@shared/directives/tilt.directive';

@Component({
  selector: 'app-customizer',
  imports: [CommonModule, CdkDrag, CdkDropList, CdkDragPreview, CdkDragPlaceholder, TiltDirective],
  providers: [CustomizerStore],
  templateUrl: './customizer.html',
  styleUrl: './customizer.css',
})
export class Customizer {
 readonly store = inject(CustomizerStore);
  private imageGen = inject(ImageGeneratorService);
  
  @ViewChild('printAreaRef') printAreaRef!: ElementRef<HTMLElement>;
  @ViewChild('captureRef') captureRef!: ElementRef<HTMLElement>;
  
  // Setter para capturar la referencia cuando el @if la renderiza
  @ViewChild('stickerRef') set content(content: ElementRef) {
     if(content) this.stickerRef = content;
  }
  stickerRef!: ElementRef<HTMLElement>;
  
  isProcessing = signal(false);

  // Imágenes locales para evitar CORS
  stickers = [
    '/assets/stickers/skull.webp',
    '/assets/stickers/graffiti.webp',
    '/assets/stickers/skate.webp',
    'https://cdn-icons-png.flaticon.com/512/4710/4710922.png',
    'https://cdn-icons-png.flaticon.com/512/1055/1055666.png'
  ];

  // DROP: Calculamos posición inicial relativa
  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer !== event.container) {
      const stickerUrl = event.item.data;
      const areaRect = this.printAreaRef.nativeElement.getBoundingClientRect();
      const dropPoint = event.dropPoint;
      
      // Centramos el sticker en el mouse (64px es mitad de 128px)
      let x = dropPoint.x - areaRect.left - 64; 
      let y = dropPoint.y - areaRect.top - 64;

      // Límites de seguridad para que no caiga fuera
      x = Math.max(-40, Math.min(x, areaRect.width - 80));
      y = Math.max(-40, Math.min(y, areaRect.height - 80));

      this.store.selectDesign(stickerUrl);
      
      // Sincronización Store <-> CDK
      setTimeout(() => this.store.updatePosition(x, y), 0);
    }
  }

  // DRAG END: Guardamos posición final
  onDragEnd(event: CdkDragEnd) {
    const position = event.source.getFreeDragPosition();
    this.store.updatePosition(position.x, position.y);
  }

  onScaleChange(event: Event) {
    const value = (event.target as HTMLInputElement).valueAsNumber;
    this.store.updateScale(value);
  }

  // GENERAR IMAGEN HQ (Matemática Pura)
  async saveDesign() {
    if (!this.store.activeDesign() || this.isProcessing()) return;
    
    if (!this.stickerRef) {
        alert('Error: No hay diseño activo en pantalla.');
        return;
    }

    this.isProcessing.set(true);

    try {
      // 1. Referencia del contenedor principal (Sudadera)
      const containerRect = this.captureRef.nativeElement.getBoundingClientRect();
      
      // 2. Referencia precisa de la IMAGEN dentro del sticker (para captar el tamaño con escala)
      const imgElement = this.stickerRef.nativeElement.querySelector('img');
      const stickerRect = imgElement 
        ? imgElement.getBoundingClientRect() 
        : this.stickerRef.nativeElement.getBoundingClientRect();

      // 3. Cálculo relativo (Matemática Vectorial)
      const relX = stickerRect.left - containerRect.left;
      const relY = stickerRect.top - containerRect.top;

      console.log('📐 Generando Canvas:', { 
          w: containerRect.width, 
          sticker: { x: relX, y: relY, w: stickerRect.width } 
      });

      const highResImage = await this.imageGen.generateComposite({
        shirtColor: this.store.shirtColor(),
        baseImageUrl: '/assets/stickers/tshirt-mask.webp', // Ruta exacta de tu imagen base
        overlayUrl: this.store.activeDesign()!.imageUrl,
        
        // Datos del DOM para el cálculo de proporción
        domWidth: containerRect.width,
        domHeight: containerRect.height,
        
        stickerX: relX,
        stickerY: relY,
        stickerWidth: stickerRect.width,
        stickerHeight: stickerRect.height
      });
      
      // Descarga
      const a = document.createElement('a');
      a.href = highResImage;
      a.download = `urbanink-design-${Date.now()}.png`;
      a.click();

    } catch (error) {
      console.error('❌ Error:', error);
      alert('Error generando imagen. Verifica que las rutas de assets sean correctas.');
    } finally {
      this.isProcessing.set(false);
    }
  }
}