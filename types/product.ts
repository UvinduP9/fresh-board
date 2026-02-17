export interface Vendor {
  id: string;
  name: string;
  phone: string;
  whatsapp?: string;
  location: Location;
  description?: string;
}

export interface Location {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  unit: 'kg' | 'g' | 'bunch' | 'item';
  category: Category;
  vendor: Vendor;
  location: Location;
  inStock: boolean;
  updatedAt: Date;
  images?: string[];
  featured?: boolean;
}
