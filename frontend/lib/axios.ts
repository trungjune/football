import axios from 'axios';
import { ROUTES } from '@shared/constants/auth';

const api = axios.create({
  baseURL: '/api', // Always use relative path - Vercel will route to backend via vercel.json
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
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
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      const token = localStorage.getItem('token');

      // Only redirect if user was already logged in (has token)
      if (token) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Redirect to login
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = `${ROUTES.LOGIN}?message=Phiên đăng nhập đã hết hạn`;
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
