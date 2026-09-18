import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { useUserStore } from '../store/useUserStore';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// EXACT 매칭 및 특정 Public Prefix 구분
const PUBLIC_EXACT_PATHS = ['/api/categories'];
const PUBLIC_PREFIX_PATHS = [
  '/api/auth/login',
  '/api/auth/refresh',
  '/api/sign-up',
  '/api/reference',
  '/api/tutors/search',
  '/api/main', // /api/main/home, /api/main/trending, /api/main/rookie 모두 포함됨
];

function isPublicApiRequest(url?: string) {
  if (!url) return false;
  
  // matchings 관련 요청은 무조건 인증 필요 (Private)
  if (url.startsWith('/api/matchings')) return false;

  const isExact = PUBLIC_EXACT_PATHS.includes(url);
  const isPrefix = PUBLIC_PREFIX_PATHS.some((path) => url.startsWith(path));
  const isTutorDetail = url.startsWith('/api/tutors/') && !url.startsWith('/api/matchings');

  return isExact || isPrefix || isTutorDetail;
}

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;

type QueueItem = {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
};
let failedQueue: QueueItem[] = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((item) => {
    if (error) {
      item.reject(error);
    } else {
      item.resolve(token as string);
    }
  });
  failedQueue = [];
}

function forceLogout() {
  if (typeof window === 'undefined') return;
  useUserStore.getState().logout();
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}

// Request Interceptor: Private API에만 토큰 자동 주입
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined' && config.headers) {
      const token = localStorage.getItem('tm_token');
      
      // ✅ Public API가 아닐 때(Private API)만 토큰을 실어 보냄
      if (token && !isPublicApiRequest(config.url)) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        // Public 요청일 경우 헤더에서 토큰 제거
        delete config.headers.Authorization;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: 401 발생 시 토큰 재발급 로직
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Public API에서 발생한 에러는 토큰 재발급을 시도하지 않음
    if (!originalRequest || isPublicApiRequest(originalRequest.url)) {
      return Promise.reject(error);
    }

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (originalRequest.url === '/api/auth/refresh') {
      forceLogout();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((newToken) => {
          if (originalRequest.headers) {
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          }
          return apiClient(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    isRefreshing = true;

    try {
      const response = await apiClient.post<{ accessToken: string }>('/api/auth/refresh');
      const newAccessToken = response.data.accessToken;

      localStorage.setItem('tm_token', newAccessToken);
      processQueue(null, newAccessToken);

      if (originalRequest.headers) {
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
      }
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      forceLogout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);