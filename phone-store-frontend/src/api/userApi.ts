import axiosInstance from './axiosConfig';
import { User, UpdateProfileRequest, ChangePasswordRequest } from '@/types/user.types';

export const userApi = {
  getProfile: async (): Promise<User> => {
    const response = await axiosInstance.get('/user/profile');
    return response.data;
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
    const response = await axiosInstance.put('/user/profile', data);
    return response.data;
  },

  changePassword: async (data: ChangePasswordRequest): Promise<{ message: string }> => {
    const response = await axiosInstance.put('/user/change-password', data);
    return response.data;
  },
};