import axios from 'axios';

// Use relative URL in development (Vite proxy) or absolute URL from env
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle network errors
    if (!error.response) {
      if (error.code === 'ECONNREFUSED' || error.message === 'Network Error') {
        error.message = 'Cannot connect to backend server. Please ensure the backend is running on port 5000.';
      } else if (error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
        error.message = 'Request timeout. The server is taking too long to respond.';
      }
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (name, email, password, gender) =>
    api.post('/auth/register', { name, email, password, gender }),
  login: (email, password) => {
    return api.post('/auth/login', { email, password }).catch((error) => {
      // Ensure error is properly formatted
      if (error.response) {
        throw error;
      }
      throw new Error('Network error. Please check your connection.');
    });
  },
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  refreshToken: (refreshToken) =>
    api.post('/auth/refresh-token', { refreshToken }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
};

export const bookingAPI = {
  create: (data) => api.post('/bookings', data),
  getAll: (params) => api.get('/bookings', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  cancel: (id) => api.patch(`/bookings/${id}/cancel`),
  lockSeats: (data) => api.post('/bookings/lock', data),
};

export const seatAPI = {
  getAll: (params) => api.get('/seats', { params }),
  getLayout: (date) => api.get('/seats/layout', { params: { date } }),
  getById: (id) => api.get(`/seats/${id}`),
};

export const adminAPI = {
  // Seats
  createSeat: (data) => api.post('/admin/seats', data),
  createMultipleSeats: (seats) => api.post('/admin/seats/bulk', { seats }),
  updateSeat: (id, data) => api.patch(`/admin/seats/${id}`, data),
  deleteSeat: (id) => api.delete(`/admin/seats/${id}`),
  // Bookings
  getAllBookings: (params) => api.get('/admin/bookings', { params }),
  cancelBooking: (id) => api.patch(`/admin/bookings/${id}/cancel`),
  // Reports
  getMonthlyReport: (params) => api.get('/admin/reports/monthly', { params }),
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  // Seat management
  forceReleaseSeat: (seatId) => api.post('/admin/seats/force-release', { seatId }),
};

export default api;

