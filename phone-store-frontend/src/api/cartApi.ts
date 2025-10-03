import axiosInstance from './axiosConfig';
import { Cart, AddToCartRequest } from '@/types/cart.types';

export const cartApi = {
  getCart: async (): Promise<Cart> => {
    const response = await axiosInstance.get('/cart');
    return response.data;
  },

  addToCart: async (data: AddToCartRequest): Promise<Cart> => {
    const response = await axiosInstance.post('/cart/add', data);
    return response.data;
  },

  updateItem: async (itemId: number, quantity: number): Promise<Cart> => {
    const response = await axiosInstance.put(`/cart/update/${itemId}`, null, {
      params: { quantity },
    });
    return response.data;
  },

  removeItem: async (itemId: number): Promise<{ message: string }> => {
    const response = await axiosInstance.delete(`/cart/remove/${itemId}`);
    return response.data;
  },

  clearCart: async (): Promise<{ message: string }> => {
    const response = await axiosInstance.delete('/cart/clear');
    return response.data;
  },
};