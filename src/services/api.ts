import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  // "Remember me" decides which store holds the session — check both.
  const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    // Session expired / revoked — clear it and send the user to sign in again,
    // but only if they were actually signed in (avoids bouncing public pages).
    if (status === 401) {
      const wasAuthed = !!(localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token'));
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('user');
      if (wasAuthed && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }

    // Give callers a consistent, human-readable message to show.
    if (!error.response) {
      error.friendlyMessage = 'Cannot reach the server. Please check your connection.';
    } else if (status === 429) {
      const retry = error.response.headers?.['retry-after'];
      error.friendlyMessage = retry
        ? `Too many attempts. Please wait ${retry} seconds and try again.`
        : 'Too many attempts. Please wait a moment and try again.';
    } else if (status === 403) {
      error.friendlyMessage = error.response.data?.message
        || 'You do not have permission to perform this action.';
    } else if (status >= 500) {
      error.friendlyMessage = 'The server ran into a problem. Please try again shortly.';
    } else {
      error.friendlyMessage = error.response.data?.message || '';
    }

    return Promise.reject(error);
  }
);

export default api;

/** Origin of the backend, derived from VITE_API_URL (strips the /api suffix). */
export const API_ORIGIN = API_URL.replace(/\/api\/?$/, '');

/**
 * Turn a stored photo_url into something the browser can actually load.
 *
 * Photos are saved as a path relative to the backend. Older records may hold
 * an absolute URL built from APP_URL — which breaks whenever APP_URL is left
 * at its default (http://localhost) or the domain changes. Both cases are
 * rewritten onto the current API origin so existing records keep working.
 */
export const resolveUploadUrl = (photoUrl?: string | null): string | null => {
  if (!photoUrl) return null;

  const path = photoUrl.startsWith('http')
    ? (() => {
        try {
          return new URL(photoUrl).pathname;
        } catch {
          return null;
        }
      })()
    : photoUrl;

  if (!path) return photoUrl;
  if (!path.includes('/uploads/')) return photoUrl;

  return `${API_ORIGIN}${path.startsWith('/') ? '' : '/'}${path}`;
};

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

  uploadLogo: (file: File) => {
    const form = new FormData();
    form.append('logo', file);
    return api.post('/universities/upload-logo', form, {
      headers: { 'Content-Type': 'multipart/form-data', Accept: 'application/json' },
    });
  },
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

  uploadPhoto: (file: File) => {
    const form = new FormData();
    form.append('photo', file);
    // Accept must stay explicit: without it the server can't tell this is an
    // API call and answers auth failures with a redirect instead of JSON.
    return api.post('/students/upload-photo', form, {
      headers: { 'Content-Type': 'multipart/form-data', Accept: 'application/json' },
    });
  },
};

// Verification API
export const verificationAPI = {
  verify: (data: any) =>
    api.post('/verify', data),
  
  getLogs: (params?: any) =>
    api.get('/verification-logs', { params }),
  
  getRecentActivity: () =>
    api.get('/verification-logs/recent'),

  recheck: (logId: number) =>
    api.post(`/verification-logs/${logId}/recheck`),

  resolveLog: (logId: number, data: { action: 'approve' | 'reject'; notes?: string; archive_ref?: string; student_id?: string; nrc_number?: string; date_of_birth?: string; gender?: string }) =>
    api.post(`/verification-logs/${logId}/resolve`, data),
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

// Registration API (verifier-organization sign up)
export const registrationAPI = {
  create: (data: any) =>
    api.post('/registrations', data),

  getAll: (params?: any) =>
    api.get('/registrations', { params }),

  updateStatus: (id: number, status: string, review_notes?: string) =>
    api.patch(`/registrations/${id}`, { status, review_notes }),
};

// Degree API
export const degreeAPI = {
  getAll: (params?: any) =>
    api.get('/degrees', { params }),
  
  getOne: (id: number) =>
    api.get(`/degrees/${id}`),

  getByUniversity: (universityId: number) =>
    api.get(`/universities/${universityId}/degrees`),
  
  create: (data: any) =>
    api.post('/degrees', data),
  
  update: (id: number, data: any) =>
    api.put(`/degrees/${id}`, data),
  
  delete: (id: number) =>
    api.delete(`/degrees/${id}`),
};

/** @deprecated use resolveUploadUrl */
export const resolvePhotoUrl = resolveUploadUrl;
