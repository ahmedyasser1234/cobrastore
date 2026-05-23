import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/useAuthStore';

const api = axios.create({
  baseURL: (import.meta as any).env.VITE_API_URL || 'http://localhost:3005',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Custom session header for guest cart
  const cartState = localStorage.getItem('elkoko-cart');
  if (cartState) {
    const { state } = JSON.parse(cartState);
    config.headers['x-session-id'] = state.sessionId;
  }
  
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong';
    const status = error.response?.status;

    if (status === 401) {
      useAuthStore.getState().logout();
    } else if (status === 403) {
      console.error('403: Permission Denied');
      toast.error('Permission Denied');
    } else {
      console.error(`${status || 'Error'}: ${message}`);
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

export default api;
