/**
 * API Service - Axios Configuration
 * AI Comic Strip Challenge 2026
 */

import axios from 'axios';

// Base URL from environment
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============ AUTH ENDPOINTS ============

export const authService = {
  register: (data) => api.post('/teams/register', data),
  login: (data) => api.post('/teams/login', data),
};

// ============ TEAM ENDPOINTS ============

export const teamService = {
  create: (data) => api.post('/teams/create', data),
  getMyTeam: () => api.get('/teams/me'),
  update: (data) => api.put('/teams/update', data),
  getRegistrationStatus: () => api.get('/teams/registration-status'),
};

// ============ PAYMENT ENDPOINTS (UPI) ============

export const paymentService = {
  getPaymentInfo: () => api.get('/payments/info'),
  submitPayment: (data) => api.post('/payments/submit', data),
  getStatus: () => api.get('/payments/status'),
};

// ============ CONTACT ENDPOINT ============

export const contactService = {
  submit: (data) => api.post('/contact/', data),
};

// ============ ADMIN ENDPOINTS ============

export const adminService = {
  getStats: () => api.get('/admin/stats'),
  getEventStats: () => api.get('/admin/event-stats'),
  getTeams: (params) => api.get('/admin/teams', { params }),
  toggleVerification: (teamId) => api.put(`/admin/teams/${teamId}/verify`),
  deleteTeam: (teamId) => api.delete(`/admin/teams/${teamId}`),
  verifyPayment: (teamId) => api.put(`/admin/payments/${teamId}/verify`),
  rejectPayment: (teamId) => api.put(`/admin/payments/${teamId}/reject`),
  getDepartments: () => api.get('/admin/departments'),
  exportCSV: (eventId) => api.get('/admin/export/csv', { params: { event_id: eventId }, responseType: 'blob' }),
  exportAllCSV: () => api.get('/admin/export/csv/all', { responseType: 'blob' }),
  getContacts: (unreadOnly = false) => api.get('/admin/contacts', { params: { unread_only: unreadOnly } }),
  markContactRead: (contactId) => api.put(`/admin/contacts/${contactId}/read`),
  getRevenueChart: (eventId) => api.get('/admin/revenue-chart', { params: { event_id: eventId } }),
  getYearWiseStats: (eventId) => api.get('/admin/year-wise-stats', { params: { event_id: eventId } }),
};

export default api;
