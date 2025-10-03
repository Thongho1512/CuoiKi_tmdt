import axiosInstance from './axiosConfig';
import { Category, CategoryRequest } from '@/types/category.types';

export const categoryApi = {
  getAll: async (): Promise<Category[]> => {
    const response = await axiosInstance.get('/categories');
    return response.data;
  },

  getById: async (id: number): Promise<Category> => {
    const response = await axiosInstance.get(`/categories/${id}`);
    return response.data;
  },

  create: async (data: CategoryRequest, image?: File): Promise<Category> => {
    const formData = new FormData();
    
    // Append all category fields directly to FormData (for @ModelAttribute)
    formData.append('name', data.name);
    formData.append('description', data.description || '');
    formData.append('imageUrl', data.imageUrl || '');
    
    // Append image if provided
    if (image) {
      formData.append('image', image);
    }
    
    const response = await axiosInstance.post('/categories', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  update: async (id: number, data: CategoryRequest, image?: File): Promise<Category> => {
    const formData = new FormData();
    
    // Append all category fields directly to FormData (for @ModelAttribute)
    formData.append('name', data.name);
    formData.append('description', data.description || '');
    formData.append('imageUrl', data.imageUrl || '');
    
    // Append image if provided
    if (image) {
      formData.append('image', image);
    }
    
    const response = await axiosInstance.put(`/categories/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  delete: async (id: number): Promise<{ message: string }> => {
    const response = await axiosInstance.delete(`/categories/${id}`);
    return response.data;
  },
};