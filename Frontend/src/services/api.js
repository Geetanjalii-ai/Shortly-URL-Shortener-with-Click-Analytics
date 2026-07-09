import axios from 'axios';

const WRITE_API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
const READ_API_URL = import.meta.env.VITE_READ_API_URL || 'http://localhost:3002';

// Axios instance for write & auth operations (port 3001)
export const writeApi = axios.create({
  baseURL: WRITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
writeApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('shortly_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Axios instance for read & analytics operations (port 3002)
export const readApi = axios.create({
  baseURL: READ_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

readApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('shortly_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
