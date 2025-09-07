import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// Poll API functions
export const pollApi = {
  // Toggle poll active status
  toggleStatus: (code: string) => api.patch(`/polls/${code}/toggle-status`),
  // Clone poll
  clone: (code: string) => api.post(`/polls/${code}/clone`),
  // Toggle poll view mode
  toggleViewMode: (code: string) => api.patch(`/polls/${code}/toggle-view-mode`),
  // Admin join poll for synchronized control
  adminJoin: (code: string) => api.post(`/polls/${code}/admin-join`),
  // Admin leave poll
  adminLeave: (code: string) => api.post(`/polls/${code}/admin-leave`),
  // Admin navigate to next question
  adminNextQuestion: (code: string) => api.post(`/polls/${code}/admin-next-question`),
  // Admin navigate to previous question
  adminPreviousQuestion: (code: string) => api.post(`/polls/${code}/admin-previous-question`),
  // Admin jump to specific question
  adminJumpQuestion: (code: string, questionIndex: number) => api.post(`/polls/${code}/admin-jump-question`, { questionIndex }),
};

export default api;
