import axios from 'axios';

const API_URL = 'https://venhart-backend-0gm6.onrender.com/api';

console.log('API_URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Dodaj token u svaki zahtev ako postoji
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
};

// Products API
export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (formData) => api.post('/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, formData) => api.put(`/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => api.delete(`/products/${id}`),
  deleteImage: (productId, publicId) =>
    api.delete(`/products/${productId}/image`, {
      data: { publicId }
    }),
  getAllAdmin: () => api.get('/products/admin/all'),
};

// Orders API
export const ordersAPI = {
  create: (orderData) => api.post('/orders', orderData),
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, statusData) => api.put(`/orders/${id}/status`, statusData),
  track: (orderNumber) => api.get(`/orders/track/${orderNumber}`),
  getStats: () => api.get('/orders/admin/stats'),
  delete: (id) => api.delete(`/orders/${id}`),
  deleteAll: () => api.delete('/orders/admin/reset-all'),
};

// Newsletter API
export const newsletterAPI = {
  subscribe: (emailData) => api.post('/newsletter', emailData),
  getAll: () => api.get('/newsletter'),
  delete: (id) => api.delete(`/newsletter/${id}`),
};

export default api;