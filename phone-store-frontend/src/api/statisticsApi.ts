import axiosInstance from './axiosConfig';
import { Statistics } from '@/types/statistics.types';

export const statisticsApi = {
  getDashboard: async (): Promise<Statistics> => {
    const response = await axiosInstance.get('/admin/statistics/dashboard');
    return response.data;
  },

  getRevenue: async (startDate: string, endDate: string): Promise<Statistics> => {
    const response = await axiosInstance.get('/admin/statistics/revenue', {
      params: { startDate, endDate },
    });
    return response.data;
  },
};