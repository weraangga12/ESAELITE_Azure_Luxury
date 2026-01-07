
export interface Product {
  id: string;
  name: string;
  category: 'Skincare' | 'Makeup' | 'Fragrance' | 'Haircare';
  price: number;
  description: string;
  image: string;
  rating: number;
  isFeatured?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
}
