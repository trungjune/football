import axios from 'axios';
import { ROUTES } from '@shared/constants/auth';
import { getSession } from 'next-auth/react';

const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3001/api',
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async config => {
    const session = await getSession();
    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
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
      // Handle unauthorized access
      window.location.href = ROUTES.LOGIN;
    }
    return Promise.reject(error);
  }
);

export default api;
