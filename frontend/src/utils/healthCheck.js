import { default as api } from '../services/api';

export const checkBackendHealth = async () => {
  try {
    const response = await api.get('/health');
    return { 
      success: true, 
      message: response.data?.message || 'Backend is running' 
    };
  } catch (error) {
    if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
      return {
        success: false,
        message: 'Cannot connect to backend server. Please ensure the backend is running on port 5000.',
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || 'Backend health check failed',
    };
  }
};

