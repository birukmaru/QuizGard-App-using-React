import axios from 'axios';
import toast from 'react-hot-toast';

// Base URL for the API - update this to your backend URL
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * Creates a configured axios instance
 * Note: We don't set auth header here since Clerk handles it differently
 */
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

/**
 * Request interceptor to add auth token from Clerk
 */
api.interceptors.request.use(
  async (config) => {
    // Get Clerk token asynchronously
    try {
      const clerkToken = await window.Clerk?.session?.getToken();
      if (clerkToken) {
        config.headers.Authorization = `Bearer ${clerkToken}`;
      }
    } catch (err) {
      // Token not available yet - that's OK, continue without auth
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor for error handling
 * Only shows toasts for critical errors, not for data-fetching errors
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    // Only show toast for critical errors (auth, server)
    if (status === 401) {
      toast.error('Session expired. Please login again.');
    } else if (status === 403) {
      toast.error('You do not have permission to perform this action.');
    } else if (status >= 500) {
      toast.error('Server error. Please try again later.');
    }
    // Don't show toasts for 404 (resource not found) or network errors
    // These are expected for data fetching and will be handled gracefully

    return Promise.reject(error);
  }
);

// ============== Categories API ==============

export const categoriesApi = {
  getAll: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/categories', data);
    toast.success('Category created successfully');
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/categories/${id}`, data);
    toast.success('Category updated successfully');
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    toast.success('Category deleted successfully');
    return response.data;
  },
};

// ============== Quizzes API ==============

export const quizzesApi = {
  getAll: async (params = {}) => {
    const response = await api.get('/quizzes', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/quizzes/${id}`);
    return response.data;
  },

  getByCategory: async (categoryId, params = {}) => {
    const response = await api.get(`/categories/${categoryId}/quizzes`, { params });
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/quizzes', data);
    toast.success('Quiz created successfully');
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/quizzes/${id}`, data);
    toast.success('Quiz updated successfully');
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/quizzes/${id}`);
    toast.success('Quiz deleted successfully');
    return response.data;
  },

  getFeatured: async () => {
    const response = await api.get('/quizzes/featured');
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/quizzes/stats');
    return response.data;
  },
};

// ============== Questions API ==============

export const questionsApi = {
  getByQuiz: async (quizId) => {
    const response = await api.get(`/quizzes/${quizId}/questions`);
    return response.data;
  },

  create: async (quizId, data) => {
    const response = await api.post(`/quizzes/${quizId}/questions`, data);
    toast.success('Question created successfully');
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/questions/${id}`, data);
    toast.success('Question updated successfully');
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/questions/${id}`);
    toast.success('Question deleted successfully');
    return response.data;
  },

  reorder: async (quizId, orderedIds) => {
    const response = await api.put(`/quizzes/${quizId}/questions/reorder`, { orderedIds });
    return response.data;
  },
};

// ============== Attempts/Results API ==============

export const attemptsApi = {
  submit: async (quizId, data) => {
    const response = await api.post(`/quizzes/${quizId}/attempts`, data);
    toast.success('Quiz submitted successfully!');
    return response.data;
  },

  getUserAttempts: async (params = {}) => {
    const response = await api.get('/attempts', { params });
    return response.data;
  },

  getAttemptById: async (id) => {
    const response = await api.get(`/attempts/${id}`);
    return response.data;
  },

  getHistory: async (params = {}) => {
    const response = await api.get('/attempts/history', { params });
    return response.data;
  },
};

// ============== Leaderboard API ==============

export const leaderboardApi = {
  getGlobal: async (params = {}) => {
    const response = await api.get('/leaderboard', { params });
    return response.data;
  },

  getByQuiz: async (quizId, params = {}) => {
    const response = await api.get(`/leaderboard/quiz/${quizId}`, { params });
    return response.data;
  },

  getByCategory: async (categoryId, params = {}) => {
    const response = await api.get(`/leaderboard/category/${categoryId}`, { params });
    return response.data;
  },
};

// ============== User/Profile API ==============

export const userApi = {
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/users/profile', data);
    toast.success('Profile updated successfully');
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/users/stats');
    return response.data;
  },

  getActivity: async (params = {}) => {
    const response = await api.get('/users/activity', { params });
    return response.data;
  },
};

// ============== Admin Analytics API ==============

export const analyticsApi = {
  getDashboardStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  getUserGrowth: async (params = {}) => {
    const response = await api.get('/admin/analytics/users', { params });
    return response.data;
  },

  getQuizPerformance: async (params = {}) => {
    const response = await api.get('/admin/analytics/quizzes', { params });
    return response.data;
  },

  getCategoryDistribution: async () => {
    const response = await api.get('/admin/analytics/categories');
    return response.data;
  },

  getRecentActivity: async (params = {}) => {
    const response = await api.get('/admin/activity', { params });
    return response.data;
  },
};

export default api;
