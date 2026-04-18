import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://backend.mmcertify.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/login', { email, password }),
  
  register: (data: any) =>
    api.post('/register', data),
  
  logout: () =>
    api.post('/logout'),
  
  me: () =>
    api.get('/me'),
};

// University API
export const universityAPI = {
  search: (query: string) =>
    api.get('/universities/search', { params: { q: query } }),
  
  getAll: (params?: any) =>
    api.get('/universities', { params }),
  
  getOne: (id: number) =>
    api.get(`/universities/${id}`),
  
  create: (data: any) =>
    api.post('/universities', data),
  
  update: (id: number, data: any) =>
    api.put(`/universities/${id}`, data),
  
  delete: (id: number) =>
    api.delete(`/universities/${id}`),
  
  stats: () =>
    api.get('/universities/stats'),
};

// Student API
export const studentAPI = {
  getAll: (params?: any) =>
    api.get('/students', { params }),
  
  getOne: (id: number) =>
    api.get(`/students/${id}`),
  
  create: (data: any) =>
    api.post('/students', data),
  
  update: (id: number, data: any) =>
    api.put(`/students/${id}`, data),
  
  delete: (id: number) =>
    api.delete(`/students/${id}`),
  
  bulkUpload: (universityId: number, students: any[]) =>
    api.post('/students/bulk-upload', { university_id: universityId, students }),
};

// Verification API
export const verificationAPI = {
  verify: (data: any) =>
    api.post('/verify', data),
  
  getLogs: (params?: any) =>
    api.get('/verification-logs', { params }),
  
  getRecentActivity: () =>
    api.get('/verification-logs/recent'),
};

// User API
export const userAPI = {
  getAll: (params?: any) =>
    api.get('/users', { params }),
  
  getOne: (id: number) =>
    api.get(`/users/${id}`),
  
  create: (data: any) =>
    api.post('/users', data),
  
  update: (id: number, data: any) =>
    api.put(`/users/${id}`, data),
  
  delete: (id: number) =>
    api.delete(`/users/${id}`),
};
