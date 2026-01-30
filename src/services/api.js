import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

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
  getAll: async () => {
    const response = await api.get('/members');
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
  }
};

// Onboarding API
export const onboardingAPI = {
  getAll: async () => {
    const response = await api.get('/onboarding');
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
  updateL2Review: async (id, l2Data) => {
    const response = await api.patch(`/onboarding/${id}/l2-review`, l2Data);
    return response.data;
  }
};

export default api;
