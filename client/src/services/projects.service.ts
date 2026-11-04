
import api from './api';

export interface Project {
  id: number;
  name: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectsResponse {
  data: Project[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const projectsService = {
  getAll: async (page = 1, limit = 10, search = '') => {
    const response = await api.get<ProjectsResponse>('/projects', {
      params: { page, limit, search },
    });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<Project>(`/projects/${id}`);
    return response.data;
  },

  create: async (data: { name: string; description: string }) => {
    const response = await api.post('/projects', data);
    return response.data;
  },

  update: async (
    id: number,
    data: { name: string; description: string },
  ) => {
    const response = await api.put(`/projects/${id}`, data);
    return response.data;
  },

  remove: async (id: number) => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  },
};

export default projectsService;
