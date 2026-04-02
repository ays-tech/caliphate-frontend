import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
});

const isBrowser = typeof window !== 'undefined';

if (isBrowser) {
  api.interceptors.request.use((config) => {
    const token = Cookies.get('token');
    if (token) {
      if (!config.headers) config.headers = {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  api.interceptors.response.use(
    (res) => res,
    (err) => {
      if (err.response?.status === 401) {
        Cookies.remove('token');
        Cookies.remove('user');
        window.location.href = '/auth/login';
      }
      return Promise.reject(err);
    },
  );
}

// ─── Auth ──────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.patch('/auth/change-password', data),
};

// ─── Scholars ──────────────────────────────────────────────────────────
export const scholarsApi = {
  getAll: (search?: string) =>
    api.get('/scholars', { params: search ? { search } : {} }),
  getOne:  (id: string)        => api.get(`/scholars/${id}`),
  create:  (formData: FormData) =>
    api.post('/scholars', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update:  (id: string, formData: FormData) =>
    api.put(`/scholars/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete:  (id: string)        => api.delete(`/scholars/${id}`),
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

  approve:        (id: string) => api.patch(`/books/${id}/approve`),
  reject:         (id: string) => api.patch(`/books/${id}/reject`),
  delete:         (id: string) => api.delete(`/books/${id}`),
  getDownloadUrl: (volumeId: string) => api.get(`/books/volumes/${volumeId}/download`),
};

// ─── Events ───────────────────────────────────────────────────────────
export const eventsApi = {
  getAll:      ()      => api.get('/events'),
  getUpcoming: ()      => api.get('/events/upcoming'),
  getOne:      (id: string) => api.get(`/events/${id}`),
  create: (data: { title: string; description?: string; date: string }) =>
    api.post('/events', data),
  delete: (id: string) => api.delete(`/events/${id}`),
};

// ─── Users ────────────────────────────────────────────────────────────
export const usersApi = {
  getAll:          () => api.get('/users'),
  getPendingAdmins:() => api.get('/users/pending-admins'),
  approve: (id: string) => api.patch(`/users/${id}/approve`),
  promote: (id: string) => api.patch(`/users/${id}/promote`),
  delete:  (id: string) => api.delete(`/users/${id}`),
};
