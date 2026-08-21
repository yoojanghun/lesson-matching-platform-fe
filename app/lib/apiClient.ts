import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { useUserStore } from '../store/useUserStore';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  withCredentials: true, // refresh token 쿠키 자동 전송
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Refresh Token 관련 상태 ────────────────────────────────────────────────
/** 현재 refresh 요청이 진행 중인지 여부 */
let isRefreshing = false;

/** refresh 완료를 기다리는 대기 요청 큐 */
type QueueItem = {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
};
let failedQueue: QueueItem[] = [];

/** 큐에 쌓인 요청들을 일괄 처리 */
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

/** 강제 로그아웃: Zustand 상태 초기화 + 토큰 제거 후 로그인 페이지로 이동 */
function forceLogout() {
  if (typeof window === 'undefined') return;
  // Zustand store의 logout (토큰 제거 + role → GUEST 포함)
  useUserStore.getState().logout();
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}
// ────────────────────────────────────────────────────────────────────────────

// Request Interceptor: JWT 토큰 자동 주입
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('tm_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: 401 감지 → refresh token으로 재발급 → 원래 요청 재시도
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // 401이 아니거나 이미 재시도한 요청은 그냥 reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // refresh 요청 자체가 401이면 무한 루프 방지
    if (originalRequest.url === '/api/auth/refresh') {
      forceLogout();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // 이미 refresh 중이면 큐에 넣고 대기
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

    // Refresh 요청 시작
    isRefreshing = true;

    try {
      // 쿠키에 담긴 refreshToken을 백엔드로 전송 (withCredentials: true로 자동 포함)
      const response = await apiClient.post<{ accessToken: string }>('/api/auth/refresh');
      const newAccessToken = response.data.accessToken;

      // 새 access token 저장
      localStorage.setItem('tm_token', newAccessToken);

      // 대기 중이던 요청들 재시도
      processQueue(null, newAccessToken);

      // 원래 요청 재시도
      if (originalRequest.headers) {
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
      }
      return apiClient(originalRequest);
    } catch (refreshError) {
      // Refresh 실패 → 모든 대기 요청 reject 후 강제 로그아웃
      processQueue(refreshError, null);
      forceLogout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
