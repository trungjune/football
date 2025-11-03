import axios from 'axios';

// Debug environment
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log(
  'API baseURL will be:',
  process.env.NODE_ENV === 'production' ? 'https://football-team-manager-pi.vercel.app/api' : '/api'
);

// Create axios instance
export const apiClient = axios.create({
  baseURL: 'https://football-team-manager-pi.vercel.app/api', // Force production URL
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
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  phone?: string;
}

export interface User {
  id: string;
  email: string;
  role: string;
  phone?: string;
  image?: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface Member {
  id: string;
  userId: string;
  fullName: string;
  nickname?: string;
  dateOfBirth?: string;
  position: string;
  height?: number;
  weight?: number;
  preferredFoot?: string;
  avatar?: string;
  memberType: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface TrainingSession {
  id: string;
  teamId: string;
  title: string;
  description?: string;
  datetime: string;
  location: string;
  type: string;
  maxParticipants?: number;
  registrationDeadline?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Fee {
  id: string;
  teamId: string;
  title: string;
  description?: string;
  amount: number;
  type: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  feeId: string;
  memberId: string;
  amount: number;
  method: string;
  status: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Auth API functions
export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    console.log('Login request:', data);
    console.log('API baseURL:', apiClient.defaults.baseURL);
    try {
      const response = await apiClient.post('/auth/login', data);
      console.log('Login response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  register: (data: RegisterRequest): Promise<AuthResponse> =>
    apiClient.post('/auth/register', data).then(res => res.data),

  getProfile: (): Promise<User> => apiClient.get('/auth/profile').then(res => res.data),

  updateProfile: (data: Partial<User>): Promise<User> =>
    apiClient.put('/auth/profile', data).then(res => res.data),
};

// Members API
export const membersApi = {
  getAll: () => apiClient.get('/members').then(res => res.data),
  getById: (id: string) => apiClient.get(`/members/${id}`).then(res => res.data),
  create: (data: any) => apiClient.post('/members', data).then(res => res.data),
  update: (id: string, data: any) => apiClient.patch(`/members/${id}`, data).then(res => res.data),
  delete: (id: string) => apiClient.delete(`/members/${id}`).then(res => res.data),
};

// Sessions API
export const sessionsApi = {
  getAll: () => apiClient.get('/sessions').then(res => res.data),
  getById: (id: string) => apiClient.get(`/sessions/${id}`).then(res => res.data),
  create: (data: any) => apiClient.post('/sessions', data).then(res => res.data),
  update: (id: string, data: any) => apiClient.patch(`/sessions/${id}`, data).then(res => res.data),
  delete: (id: string) => apiClient.delete(`/sessions/${id}`).then(res => res.data),
};

// Finance API
export const financeApi = {
  getFees: () => apiClient.get('/finance/fees').then(res => res.data),
  getPayments: () => apiClient.get('/finance/payments').then(res => res.data),
  getSummary: () => apiClient.get('/finance/summary').then(res => res.data),
  createFee: (data: any) => apiClient.post('/finance/fees', data).then(res => res.data),
  createPayment: (data: any) => apiClient.post('/finance/payments', data).then(res => res.data),
};
