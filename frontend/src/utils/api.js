/**
 * @file frontend/src/utils/api.js
 * @description This file centralizes all API communication for the frontend application.
 * It uses the `axios` library to create a pre-configured instance with a base URL and a timeout.
 * An interceptor is used to automatically add the authentication token to every outgoing request, which simplifies the process of making authenticated API calls.
 * It also includes a response interceptor to handle authentication errors globally, redirecting the user to the login page if their token is invalid or expired.
 * The file exports a set of API-specific objects (`authAPI`, `sessionAPI`, `uiAPI`) that provide a clean and organized way to interact with the backend services.
 */
import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  timeout: 360000, // 6 minute timeout for multi-agent systems
});

// Add auth token to requests automatically
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

// Handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
};

// Session API calls
export const sessionAPI = {
  getAll: () => api.get('/api/sessions'),
  getById: (id) => api.get(`/api/sessions/${id}`),
  create: (data) => api.post('/api/sessions', data),
  update: (id, data) => api.put(`/api/sessions/${id}`, data),
  delete: (id) => api.delete(`/api/sessions/${id}`),
};

// Pages API calls
export const pagesAPI = {
  generatePage: (requestData) => api.post('/api/pages/generatePage', requestData),
  getPageById: (id) => api.get(`/api/pages/${id}`),
  getAllPages: (params) => api.get('/api/pages', { params }),
  getPagesBySessionId: (sessionId) => api.get(`/api/pages?sessionId=${sessionId}`),
};


export default api;