export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  categoryId: number;
  categoryName: string;
  imageUrl?: string;
  specifications?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface ProductRequest {
  name: string;
  description?: string;
  price: number;
  stock: number;
  categoryId: number;
  imageUrl?: string;
  specifications?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface ProductFilters {
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  keyword?: string;
  sortBy?: string;
  sortDir?: 'ASC' | 'DESC';
}