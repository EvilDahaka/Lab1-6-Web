
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  updatedAt?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface UsersResponse {
  data: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
