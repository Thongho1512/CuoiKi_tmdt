import axiosInstance from './axiosConfig';
import { Product, ProductRequest, PageResponse } from '@/types';

export const productApi = {
  getAll: async (page = 0, size = 12, sortBy = 'id', sortDir = 'DESC'): Promise<PageResponse<Product>> => {
    const response = await axiosInstance.get('/products', {
      params: { page, size, sortBy, sortDir },
    });
    return response.data;
  },

  getById: async (id: number): Promise<Product> => {
    const response = await axiosInstance.get(`/products/${id}`);
    return response.data;
  },

  search: async (keyword: string, page = 0, size = 12): Promise<PageResponse<Product>> => {
    const response = await axiosInstance.get('/products/search', {
      params: { keyword, page, size },
    });
    return response.data;
  },

  getByCategory: async (categoryId: number, page = 0, size = 12, sortBy = 'id', sortDir = 'DESC'): Promise<PageResponse<Product>> => {
    const response = await axiosInstance.get(`/products/category/${categoryId}`, {
      params: { page, size, sortBy, sortDir },
    });
    return response.data;
  },

  getByPriceRange: async (minPrice: number, maxPrice: number, page = 0, size = 12): Promise<PageResponse<Product>> => {
    const response = await axiosInstance.get('/products/price-range', {
      params: { minPrice, maxPrice, page, size },
    });
    return response.data;
  },

  create: async (data: ProductRequest, image?: File): Promise<Product> => {
    const formData = new FormData();
    
    // Append all product fields directly to FormData (for @ModelAttribute)
    formData.append('name', data.name);
    formData.append('description', data.description || '');
    formData.append('price', data.price.toString());
    formData.append('stock', data.stock.toString());
    formData.append('categoryId', data.categoryId.toString());
    formData.append('imageUrl', data.imageUrl || '');
    formData.append('specifications', data.specifications || '');
    formData.append('status', data.status || 'ACTIVE');
    
    // Append image if provided
    if (image) {
      formData.append('image', image);
    }
    
    const response = await axiosInstance.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  update: async (id: number, data: ProductRequest, image?: File): Promise<Product> => {
    const formData = new FormData();
    
    // Append all product fields directly to FormData (for @ModelAttribute)
    formData.append('name', data.name);
    formData.append('description', data.description || '');
    formData.append('price', data.price.toString());
    formData.append('stock', data.stock.toString());
    formData.append('categoryId', data.categoryId.toString());
    formData.append('imageUrl', data.imageUrl || '');
    formData.append('specifications', data.specifications || '');
    formData.append('status', data.status || 'ACTIVE');
    
    // Append image if provided
    if (image) {
      formData.append('image', image);
    }
    
    const response = await axiosInstance.put(`/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  delete: async (id: number): Promise<{ message: string }> => {
    const response = await axiosInstance.delete(`/products/${id}`);
    return response.data;
  },

  updateStock: async (id: number, stock: number): Promise<{ message: string }> => {
    const response = await axiosInstance.put(`/products/${id}/stock`, null, {
      params: { stock },
    });
    return response.data;
  },
};