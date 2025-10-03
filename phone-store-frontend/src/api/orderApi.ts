import axiosInstance from './axiosConfig';
import { Order, OrderDetail, CreateOrderRequest, UpdateOrderStatusRequest, PageResponse, OrderStatus } from '@/types';

export const orderApi = {
  create: async (data: CreateOrderRequest): Promise<OrderDetail> => {
    const response = await axiosInstance.post('/orders', data);
    return response.data;
  },

  getMyOrders: async (page = 0, size = 10): Promise<PageResponse<Order>> => {
    const response = await axiosInstance.get('/orders', {
      params: { page, size },
    });
    return response.data;
  },

  getMyOrdersByStatus: async (status: OrderStatus, page = 0, size = 10): Promise<PageResponse<Order>> => {
    const response = await axiosInstance.get(`/orders/status/${status}`, {
      params: { page, size },
    });
    return response.data;
  },

  getById: async (id: number): Promise<OrderDetail> => {
    const response = await axiosInstance.get(`/orders/${id}`);
    return response.data;
  },

  getByCode: async (orderCode: string): Promise<OrderDetail> => {
    const response = await axiosInstance.get(`/orders/code/${orderCode}`);
    return response.data;
  },

  cancel: async (id: number): Promise<{ message: string }> => {
    const response = await axiosInstance.put(`/orders/${id}/cancel`);
    return response.data;
  },

  // Admin endpoints
  getAllOrders: async (page = 0, size = 10): Promise<PageResponse<Order>> => {
    const response = await axiosInstance.get('/admin/orders', {
      params: { page, size },
    });
    return response.data;
  },

  getOrdersByStatus: async (status: OrderStatus, page = 0, size = 10): Promise<PageResponse<Order>> => {
    const response = await axiosInstance.get(`/admin/orders/status/${status}`, {
      params: { page, size },
    });
    return response.data;
  },

  searchOrders: async (keyword: string, page = 0, size = 10): Promise<PageResponse<Order>> => {
    const response = await axiosInstance.get('/admin/orders/search', {
      params: { keyword, page, size },
    });
    return response.data;
  },

  updateStatus: async (id: number, data: UpdateOrderStatusRequest): Promise<{ message: string }> => {
    const response = await axiosInstance.put(`/admin/orders/${id}/status`, data);
    return response.data;
  },
};