// types.ts
interface UserReference {
  _id: string;
  name?: string;
  email?: string;
  image?: string;
  description?: string;
  location?: string;
  phone?: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  brand: string;
  image: string;
  specifications?: Record<string, string>;
  seller: UserReference;
  sellerType: 'official' | 'fictional' | 'user'; // Añade esta línea
  currencyType: 'usd' | 'ars';
  condition: 'Used' | 'New';
  fictionalSellerIndex?: number; // Opcional, si lo necesitas
  isPreloaded?: boolean;
  createdAt?: string;
  updatedAt?: string;
}