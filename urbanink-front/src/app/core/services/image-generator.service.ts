import { Injectable } from '@angular/core';

export interface CompositionConfig {
  shirtColor: string;
  baseImageUrl: string;
  overlayUrl: string;
  
  // Dimensiones del contenedor en pantalla (DOM)
  domWidth: number;
  domHeight: number;
  
  // Sticker en pantalla
  stickerX: number;
  stickerY: number;
  stickerWidth: number;
  stickerHeight: number;
  rotation?: number;
}

@Injectable({ providedIn: 'root' })
export class ImageGeneratorService {

  // Definimos una resolución de salida alta fija (ej: 2000px ancho)
  private readonly TARGET_WIDTH = 2000; 

  async generateComposite(config: CompositionConfig): Promise<string> {
    console.log('🎨 Iniciando generación de imagen...', config);

    return new Promise(async (resolve, reject) => {
      try {
        // 1. Cargar imágenes primero (Esperar a que existan)
        const [baseImg, stickerImg] = await Promise.all([
          this.loadImage(config.baseImageUrl),
          this.loadImage(config.overlayUrl)
        ]);

        // 2. Crear Canvas en memoria
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;

        // 3. Calcular Factor de Escala
        // Cuántas veces es más grande la imagen de salida que lo que ves en pantalla
        const scaleFactor = this.TARGET_WIDTH / config.domWidth;
        
        canvas.width = this.TARGET_WIDTH;
        canvas.height = config.domHeight * scaleFactor;

        console.log(`📏 Escala calculada: ${scaleFactor.toFixed(2)}x`);

        // --- CAPA 1: FONDO COLOR (Sudadera) ---
        ctx.fillStyle = config.shirtColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // --- CAPA 2: BASE (Máscara/Sudadera) ---
        // Dibujamos la sudadera ocupando todo el canvas
        ctx.drawImage(baseImg, 0, 0, canvas.width, canvas.height);

        // --- CAPA 3: STICKER ---
        const sX = config.stickerX * scaleFactor;
        const sY = config.stickerY * scaleFactor;
        const sW = config.stickerWidth * scaleFactor;
        const sH = config.stickerHeight * scaleFactor;

        ctx.save();
        // Efecto realista (multiplicar color sobre textura)
        ctx.globalCompositeOperation = 'multiply'; 
        
        // Aquí podrías añadir rotación si la tuvieras
        ctx.drawImage(stickerImg, sX, sY, sW, sH);
        
        ctx.restore();

        // 4. Retornar Data URL
        console.log('✅ Imagen generada correctamente');
        resolve(canvas.toDataURL('image/png', 1.0)); // Calidad máxima

      } catch (error) {
        console.error('❌ Error en generador:', error);
        reject(error);
      }
    });
  }

  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous'; // CRÍTICO PARA CORS
      img.src = src;
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(`No se pudo cargar la imagen: ${src}`);
    });
  }
}