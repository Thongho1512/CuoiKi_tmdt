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

  create: async (data: CategoryRequest): Promise<Category> => {
    const response = await axiosInstance.post('/categories', data);
    return response.data;
  },

  update: async (id: number, data: CategoryRequest): Promise<Category> => {
    const response = await axiosInstance.put(`/categories/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<{ message: string }> => {
    const response = await axiosInstance.delete(`/categories/${id}`);
    return response.data;
  },
};
