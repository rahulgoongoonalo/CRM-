import axios from 'axios';

// API URL - in development, use relative URL to leverage Vite proxy
// In production, use environment variable or full URL
const API_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
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

// Handle 401 responses - auto logout on invalid token
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  }
};

// Members API
export const membersAPI = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page);
    if (params.limit) query.set('limit', params.limit);
    if (params.search) query.set('search', params.search);
    if (params.status) query.set('status', params.status);
    if (params.tier) query.set('tier', params.tier);
    if (params.source) query.set('source', params.source);
    if (params.sortBy) query.set('sortBy', params.sortBy);
    if (params.sortOrder) query.set('sortOrder', params.sortOrder);
    const queryStr = query.toString();
    const response = await api.get(`/members${queryStr ? '?' + queryStr : ''}`);
    return response.data;
  },
  getList: async () => {
    const response = await api.get('/members/list');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/members/${id}`);
    return response.data;
  },
  create: async (memberData) => {
    const response = await api.post('/members', memberData);
    return response.data;
  },
  update: async (id, memberData) => {
    const response = await api.put(`/members/${id}`, memberData);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/members/${id}`);
    return response.data;
  },
  bulkUpdate: async (updates) => {
    const response = await api.put('/members/bulk-update', { updates });
    return response.data;
  }
};

// Onboarding API
export const onboardingAPI = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page);
    if (params.limit) query.set('limit', params.limit);
    if (params.search) query.set('search', params.search);
    if (params.status) query.set('status', params.status);
    if (params.sortBy) query.set('sortBy', params.sortBy);
    if (params.sortOrder) query.set('sortOrder', params.sortOrder);
    const queryStr = query.toString();
    const response = await api.get(`/onboarding${queryStr ? '?' + queryStr : ''}`);
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/onboarding/${id}`);
    return response.data;
  },
  create: async (onboardingData) => {
    const response = await api.post('/onboarding', onboardingData);
    return response.data;
  },
  update: async (id, onboardingData) => {
    const response = await api.put(`/onboarding/${id}`, onboardingData);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/onboarding/${id}`);
    return response.data;
  },
  updateStep1: async (id, step1Data) => {
    const response = await api.patch(`/onboarding/${id}/step1`, step1Data);
    return response.data;
  },
  updateL1Questionnaire: async (id, l1Data) => {
    const response = await api.patch(`/onboarding/${id}/l1-questionnaire`, l1Data);
    return response.data;
  },
  saveL1Progress: async (id, l1Data) => {
    const response = await api.patch(`/onboarding/${id}/l1-questionnaire/save-progress`, l1Data);
    return response.data;
  },
  updateL2Review: async (id, l2Data) => {
    const response = await api.patch(`/onboarding/${id}/l2-review`, l2Data);
    return response.data;
  },
  uploadDocument: async (id, formData) => {
    const response = await api.post(`/onboarding/${id}/l2-review/upload-document`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  deleteDocument: async (id, docIndex) => {
    const response = await api.delete(`/onboarding/${id}/l2-review/document/${docIndex}`);
    return response.data;
  }
};

// Glossary API
export const glossaryAPI = {
  getAll: async () => {
    const response = await api.get('/glossary');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/glossary/${id}`);
    return response.data;
  },
  create: async (formData) => {
    const response = await api.post('/glossary', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  update: async (id, formData) => {
    const response = await api.put(`/glossary/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/glossary/${id}`);
    return response.data;
  },
  download: (id) => {
    return `${API_URL}/glossary/${id}/download`;
  },
};

// FAQ API
export const faqAPI = {
  getAll: async () => {
    const response = await api.get('/faq');
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/faq', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/faq/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/faq/${id}`);
    return response.data;
  },
};

// Picklist API
export const picklistAPI = {
  getAll: async () => {
    const response = await api.get('/picklists');
    return response.data;
  },
  getByName: async (name) => {
    const response = await api.get(`/picklists/${name}`);
    return response.data;
  },
  addItem: async (name, itemData) => {
    const response = await api.post(`/picklists/${name}/items`, itemData);
    return response.data;
  },
  deleteItem: async (name, itemId) => {
    const response = await api.delete(`/picklists/${name}/items/${itemId}`);
    return response.data;
  }
};

// Reports API
export const getOnboardingStatusReport = async () => {
  const response = await api.get('/onboarding/reports/onboarding-status');
  return response.data;
};

export const getFullExportData = async () => {
  const response = await api.get('/onboarding/reports/full-export');
  return response.data;
};

export default api;
