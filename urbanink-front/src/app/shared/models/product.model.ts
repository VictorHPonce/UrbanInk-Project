export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  
  // Propiedades de estado
  isAvailable: boolean;
  isActive: boolean;
  stock: number;      // Nuevo
  isNew: boolean;     // Nuevo (Calculado)
  isFeatured: boolean;// Nuevo
}