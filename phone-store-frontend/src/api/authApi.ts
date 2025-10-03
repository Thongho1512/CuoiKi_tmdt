import axiosInstance from './axiosConfig';
import { LoginRequest, RegisterRequest, JwtResponse } from '@/types/auth.types';

export const authApi = {
  login: async (data: LoginRequest): Promise<JwtResponse> => {
    const response = await axiosInstance.post('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<{ message: string }> => {
    const response = await axiosInstance.post('/auth/register', data);
    return response.data;
  },

  logout: async (): Promise<{ message: string }> => {
    const response = await axiosInstance.post('/auth/logout');
    return response.data;
  },
};