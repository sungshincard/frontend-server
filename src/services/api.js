import axios from 'axios';
import { useAuthStore } from '../stores/auth';
import { toast } from 'vue3-toastify';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api', // Backend server URL
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(config => {
  const authStore = useAuthStore();
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`;
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response) {
      if (error.response.status === 401) {
        const authStore = useAuthStore();
        authStore.logout();
        toast.error('세션이 만료되었습니다. 다시 로그인해주세요.');
        window.location.href = '/login';
      } else {
        toast.error(error.response.data?.message || '서버 오류가 발생했습니다.');
      }
    } else {
      toast.error('네트워크 오류가 발생했습니다.');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
