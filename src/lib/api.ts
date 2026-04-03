import axios, { InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const FRONTEND_URL = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
});

// ── Request interceptor — attach JWT ──────────────────────────────────
// InternalAxiosRequestConfig is the correct type for Axios v1+ interceptors
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

// ── Response interceptor — transform media URLs ──────────────────────
api.interceptors.response.use((res) => {
  // Transform any /media/ URLs to point to frontend
  if (res.data) {
    const transformMediaUrls = (obj: any): any => {
      if (typeof obj === 'string' && obj.startsWith('/media/')) {
        return `${FRONTEND_URL}${obj}`;
      }
      if (Array.isArray(obj)) {
        return obj.map(transformMediaUrls);
      }
      if (obj && typeof obj === 'object') {
        const transformed: any = {};
        for (const key in obj) {
          transformed[key] = transformMediaUrls(obj[key]);
        }
        return transformed;
      }
      return obj;
    };
    res.data = transformMediaUrls(res.data);
  }
  return res;
});

// ── Response interceptor — redirect on 401 ───────────────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      Cookies.remove('token');
      Cookies.remove('user');
      window.location.href = '/auth/login';
    }
    return Promise.reject(err);
  },
);

// ─── Auth ─────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.patch('/auth/change-password', data),
};

// ─── Scholars ─────────────────────────────────────────────────────────
export const scholarsApi = {
  getAll: (search?: string) =>
    api.get('/scholars', { params: search ? { search } : {} }),
  getOne:  (id: string)         => api.get(`/scholars/${id}`),
  create:  (formData: FormData) =>
    api.post('/scholars', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update:  (id: string, formData: FormData) =>
    api.put(`/scholars/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete:  (id: string)         => api.delete(`/scholars/${id}`),
};

// ─── Books ────────────────────────────────────────────────────────────
export const booksApi = {
  getAll: (params?: {
    search?: string; scholarId?: string; type?: string; page?: number; limit?: number;
  }) => api.get('/books', { params }),

  getAllAdmin: (params?: {
    search?: string; status?: string; page?: number; limit?: number;
  }) => api.get('/books/admin/all', { params }),

  getMostRead:    (limit?: number) => api.get('/books/most-read', { params: { limit } }),
  getRecent:      (limit?: number) => api.get('/books/recent',    { params: { limit } }),
  getOne:         (id: string)     => api.get(`/books/${id}`),

  create: (formData: FormData) =>
    api.post('/books', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),

  update: (id: string, formData: FormData) =>
    api.patch(`/books/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),

  addVolume: (bookId: string, formData: FormData) =>
    api.post(`/books/${bookId}/volumes`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),

  approve:        (id: string)     => api.patch(`/books/${id}/approve`),
  reject:         (id: string)     => api.patch(`/books/${id}/reject`),
  delete:         (id: string)     => api.delete(`/books/${id}`),
  getDownloadUrl: (volumeId: string) => api.get(`/books/volumes/${volumeId}/download`),
};

// ─── Events ───────────────────────────────────────────────────────────
export const eventsApi = {
  getAll:      ()                => api.get('/events'),
  getUpcoming: ()                => api.get('/events/upcoming'),
  getOne:      (id: string)      => api.get(`/events/${id}`),
  create: (data: { title: string; description?: string; date: string }) =>
    api.post('/events', data),
  delete: (id: string)           => api.delete(`/events/${id}`),
};

// ─── Users ────────────────────────────────────────────────────────────
export const usersApi = {
  getAll:           ()           => api.get('/users'),
  getPendingAdmins: ()           => api.get('/users/pending-admins'),
  approve:  (id: string)         => api.patch(`/users/${id}/approve`),
  promote:  (id: string)         => api.patch(`/users/${id}/promote`),
  delete:   (id: string)         => api.delete(`/users/${id}`),
};
