import axios from 'axios';

const API_BASE_URL = 'https://xexit-a3xo.onrender.com';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
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

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  getCurrentUser: () => api.get('/auth/me')
};

// Resignations API
export const resignationsAPI = {
  getAll: () => api.get('/resignations'),
  getById: (id) => api.get(`/resignations/${id}`),
  create: (data) => api.post('/resignations', data),
  approve: (id, exitDate) => api.patch(`/resignations/${id}/approve`, { exitDate }),
  reject: (id, rejectionReason) => api.patch(`/resignations/${id}/reject`, { rejectionReason })
};

// Exit Interviews API
export const exitInterviewsAPI = {
  getAll: () => api.get('/exit-interviews'),
  getById: (id) => api.get(`/exit-interviews/${id}`),
  getByResignationId: (resignationId) => api.get(`/exit-interviews/resignation/${resignationId}`),
  create: (data) => api.post('/exit-interviews', data),
  markAsReviewed: (id) => api.patch(`/exit-interviews/${id}/review`)
};

export default api;
