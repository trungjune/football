import axios from 'axios';
import { User } from '@shared/types/entities/user';
import { LoginRequest, RegisterRequest, AuthResponse } from '@shared/types/api/auth';
import { API_ENDPOINTS } from '@shared/constants/api';

// Create axios instance
export const apiClient = axios.create({
  baseURL: '/api', // Always use relative path - Vercel will route to backend via vercel.json
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      const token = localStorage.getItem('token');

      // Only redirect if user was already logged in (has token)
      if (token) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('tokenTimestamp');

        // Redirect to login
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login?message=Phiên đăng nhập đã hết hạn';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Re-export shared types for backward compatibility
export type { User, LoginRequest, RegisterRequest } from '@shared';
export type { AuthResponse } from '@shared/types/api/auth';

// Re-export shared types
export type { Member } from '@shared/types/entities/member';

export type { Session as TrainingSession } from '@shared/types/entities/session';

export type { Fee, Payment } from '@shared/types/entities/fee';

// Auth API functions
export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  register: (data: RegisterRequest): Promise<AuthResponse> =>
    apiClient.post(API_ENDPOINTS.AUTH.REGISTER, data).then(res => res.data),

  getProfile: (): Promise<User> => apiClient.get(API_ENDPOINTS.AUTH.PROFILE).then(res => res.data),

  updateProfile: (data: Partial<User>): Promise<User> =>
    apiClient.put(API_ENDPOINTS.AUTH.PROFILE, data).then(res => res.data),

  logout: (): Promise<{ message: string }> =>
    apiClient.post(API_ENDPOINTS.AUTH.LOGOUT).then(res => res.data),
};

// Members API
export const membersApi = {
  getAll: () => apiClient.get(API_ENDPOINTS.MEMBERS.LIST).then(res => res.data),
  getById: (id: string) => apiClient.get(API_ENDPOINTS.MEMBERS.BY_ID(id)).then(res => res.data),
  create: (data: Record<string, unknown>) =>
    apiClient.post(API_ENDPOINTS.MEMBERS.CREATE, data).then(res => res.data),
  update: (id: string, data: Record<string, unknown>) =>
    apiClient.patch(API_ENDPOINTS.MEMBERS.UPDATE(id), data).then(res => res.data),
  delete: (id: string) => apiClient.delete(API_ENDPOINTS.MEMBERS.DELETE(id)).then(res => res.data),
};

// Sessions API
export const sessionsApi = {
  getAll: () => apiClient.get(API_ENDPOINTS.SESSIONS.LIST).then(res => res.data),
  getById: (id: string) => apiClient.get(API_ENDPOINTS.SESSIONS.BY_ID(id)).then(res => res.data),
  create: (data: Record<string, unknown>) =>
    apiClient.post(API_ENDPOINTS.SESSIONS.CREATE, data).then(res => res.data),
  update: (id: string, data: Record<string, unknown>) =>
    apiClient.patch(API_ENDPOINTS.SESSIONS.UPDATE(id), data).then(res => res.data),
  delete: (id: string) => apiClient.delete(API_ENDPOINTS.SESSIONS.DELETE(id)).then(res => res.data),
};

// Finance API
export const financeApi = {
  getFees: () => apiClient.get(API_ENDPOINTS.FINANCE.FEES.LIST).then(res => res.data),
  getPayments: () => apiClient.get(API_ENDPOINTS.FINANCE.PAYMENTS.LIST).then(res => res.data),
  getSummary: () => apiClient.get(API_ENDPOINTS.FINANCE.REPORTS.SUMMARY).then(res => res.data),
  createFee: (data: Record<string, unknown>) =>
    apiClient.post(API_ENDPOINTS.FINANCE.FEES.CREATE, data).then(res => res.data),
  createPayment: (data: Record<string, unknown>) =>
    apiClient.post(API_ENDPOINTS.FINANCE.PAYMENTS.CREATE, data).then(res => res.data),
};

// Statistics API
export const statisticsApi = {
  getStats: () => apiClient.get(API_ENDPOINTS.DASHBOARD.STATS).then(res => res.data),
};

// Settings API
export const settingsApi = {
  getSettings: () => apiClient.get('/settings').then(res => res.data),
  updateSettings: (data: Record<string, unknown>) =>
    apiClient.put('/settings', data).then(res => res.data),
};
