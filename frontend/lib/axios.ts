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
      console.log('[axios] Adding token to request:', config.url, 'Token:', token.substring(0, 20) + '...');
    } else {
      console.log('[axios] No token found for request:', config.url);
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
    console.log('[axios] Response error:', error.response?.status, error.config?.url);
    
    if (error.response?.status === 401) {
      const token = localStorage.getItem('token');
      console.log('[axios] 401 Unauthorized, token exists:', !!token);

      // Only redirect if user was already logged in (has token)
      if (token) {
        console.log('[axios] Clearing auth and redirecting to login');
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Show notification if possible
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }

        window.location.href = `${ROUTES.LOGIN}?message=Phiên đăng nhập đã hết hạn`;
      } else {
        console.log('[axios] No token, not redirecting');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
