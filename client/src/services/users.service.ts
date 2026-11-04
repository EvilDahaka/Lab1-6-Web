import api from './api';
import type { User, UsersResponse } from '@/types/api.types';

const usersService = {
  getAll: async (page = 1, limit = 10, search = '') => {
    const response = await api.get<UsersResponse>('/users', {
      params: { page, limit, search },
    });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  create: async (data: {
    name: string;
    email: string;
    password: string;
  }) => {
    const response = await api.post<User>('/users', data);
    return response.data;
  },

  update: async (id: number, data: Partial<User>) => {
    const response = await api.put<User>(`/users/${id}`, data);
    return response.data;
  },

  remove: async (id: number) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};

export default usersService;